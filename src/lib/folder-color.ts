export const DEFAULT_FOLDER_COLOR = '#90a4ae';

const HEX_COLOR = /^#(?:[\da-f]{3}|[\da-f]{6})$/i;

export function normalizeFolderColor(color: unknown): string {
  if (typeof color !== 'string' || !HEX_COLOR.test(color)) {
    return DEFAULT_FOLDER_COLOR;
  }

  const value = color.toLowerCase();
  if (value.length === 4) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`;
  }
  return value;
}

function hexToRgb(color: string): [number, number, number] {
  const value = normalizeFolderColor(color).slice(1);
  return [0, 2, 4].map((index) =>
    Number.parseInt(value.slice(index, index + 2), 16)
  ) as [number, number, number];
}

// A compact implementation of the CSS filter solver by Barrett Sonntag.
// It finds a close approximation of an RGB color using standard filter functions.
class Color {
  constructor(
    public r: number,
    public g: number,
    public b: number
  ) {}

  clamp(value: number) {
    return Math.min(255, Math.max(0, value));
  }

  multiply(matrix: number[]) {
    const { r, g, b } = this;
    this.r = this.clamp(r * matrix[0] + g * matrix[1] + b * matrix[2]);
    this.g = this.clamp(r * matrix[3] + g * matrix[4] + b * matrix[5]);
    this.b = this.clamp(r * matrix[6] + g * matrix[7] + b * matrix[8]);
  }

  invert(value = 1) {
    this.r = this.clamp((value + (this.r / 255) * (1 - 2 * value)) * 255);
    this.g = this.clamp((value + (this.g / 255) * (1 - 2 * value)) * 255);
    this.b = this.clamp((value + (this.b / 255) * (1 - 2 * value)) * 255);
  }

  sepia(value = 1) {
    this.multiply([
      0.393 + 0.607 * (1 - value),
      0.769 - 0.769 * (1 - value),
      0.189 - 0.189 * (1 - value),
      0.349 - 0.349 * (1 - value),
      0.686 + 0.314 * (1 - value),
      0.168 - 0.168 * (1 - value),
      0.272 - 0.272 * (1 - value),
      0.534 - 0.534 * (1 - value),
      0.131 + 0.869 * (1 - value),
    ]);
  }

  saturate(value: number) {
    this.multiply([
      0.213 + 0.787 * value,
      0.715 - 0.715 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 + 0.285 * value,
      0.072 - 0.072 * value,
      0.213 - 0.213 * value,
      0.715 - 0.715 * value,
      0.072 + 0.928 * value,
    ]);
  }

  hueRotate(angle: number) {
    const rad = (angle / 180) * Math.PI;
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);
    this.multiply([
      0.213 + cos * 0.787 - sin * 0.213,
      0.715 - cos * 0.715 - sin * 0.715,
      0.072 - cos * 0.072 + sin * 0.928,
      0.213 - cos * 0.213 + sin * 0.143,
      0.715 + cos * 0.285 + sin * 0.14,
      0.072 - cos * 0.072 - sin * 0.283,
      0.213 - cos * 0.213 - sin * 0.787,
      0.715 - cos * 0.715 + sin * 0.715,
      0.072 + cos * 0.928 + sin * 0.072,
    ]);
  }

  brightness(value: number) {
    this.r = this.clamp(this.r * value);
    this.g = this.clamp(this.g * value);
    this.b = this.clamp(this.b * value);
  }

  contrast(value: number) {
    this.r = this.clamp((this.r - 128) * value + 128);
    this.g = this.clamp((this.g - 128) * value + 128);
    this.b = this.clamp((this.b - 128) * value + 128);
  }
}

const filterCache = new Map<string, string>();

export function folderColorFilter(input: unknown): string {
  const color = normalizeFolderColor(input);
  if (color === DEFAULT_FOLDER_COLOR) return '';
  const cached = filterCache.get(color);
  if (cached) return cached;

  const target = hexToRgb(color);
  const loss = (values: number[]) => {
    const result = new Color(0, 0, 0);
    result.invert(values[0] / 100);
    result.sepia(values[1] / 100);
    result.saturate(values[2] / 100);
    result.hueRotate(values[3] * 3.6);
    result.brightness(values[4] / 100);
    result.contrast(values[5] / 100);
    return (
      Math.abs(result.r - target[0]) +
      Math.abs(result.g - target[1]) +
      Math.abs(result.b - target[2])
    );
  };
  const clampValues = (values: number[]) => {
    values[0] = Math.min(100, Math.max(0, values[0]));
    values[1] = Math.min(100, Math.max(0, values[1]));
    values[2] = Math.min(7500, Math.max(0, values[2]));
    values[3] = ((values[3] % 100) + 100) % 100;
    values[4] = Math.min(200, Math.max(0, values[4]));
    values[5] = Math.min(200, Math.max(0, values[5]));
    return values;
  };

  let best = { loss: Number.POSITIVE_INFINITY, values: [] as number[] };
  // Multiple hue seeds avoid local minima, especially for dark saturated colors.
  for (let hue = 0; hue < 100; hue += 10) {
    let values = [50, 50, 3750, hue, 100, 100];
    let currentLoss = loss(values);
    let step = [25, 25, 1875, 10, 50, 50];

    for (let pass = 0; pass < 16; pass += 1) {
      for (let index = 0; index < values.length; index += 1) {
        for (const direction of [-1, 1]) {
          const candidate = clampValues([...values]);
          candidate[index] += step[index] * direction;
          clampValues(candidate);
          const candidateLoss = loss(candidate);
          if (candidateLoss < currentLoss) {
            values = candidate;
            currentLoss = candidateLoss;
          }
        }
      }
      step = step.map((value) => value / 2);
    }
    if (currentLoss < best.loss) best = { loss: currentLoss, values };
  }

  const [invert, sepia, saturate, hue, brightness, contrast] = best.values;
  const filter = `brightness(0) saturate(100%) invert(${invert.toFixed(1)}%) sepia(${sepia.toFixed(1)}%) saturate(${saturate.toFixed(0)}%) hue-rotate(${(hue * 3.6).toFixed(0)}deg) brightness(${brightness.toFixed(1)}%) contrast(${contrast.toFixed(1)}%)`;
  filterCache.set(color, filter);
  return filter;
}

export function decorateGenericIcon(
  icon: HTMLElement,
  iconName: string,
  folderColor: unknown,
  fileColor?: unknown
) {
  const isFolder = iconName === 'folder.svg' || iconName === 'folder-open.svg';
  const isFile = iconName === 'file.svg';
  icon.toggleAttribute(
    'data-material-icons-extension-generic-folder',
    isFolder
  );
  icon.toggleAttribute('data-material-icons-extension-generic-file', isFile);

  const color = isFolder ? folderColor : isFile ? fileColor : undefined;
  const filter = color === undefined ? '' : folderColorFilter(color);
  if (filter) {
    icon.style.setProperty('--material-icons-extension-color-filter', filter);
  } else {
    icon.style.removeProperty('--material-icons-extension-color-filter');
  }
}
