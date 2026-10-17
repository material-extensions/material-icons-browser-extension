import { Box, Slider, Typography } from '@mui/material';
import { useEffect, useState } from 'react';

type PercentageSliderProps = {
  label: string;
  value: number;
  onChange?: (value: number) => void;
};

export function PercentageSlider({
  label,
  value,
  onChange,
}: PercentageSliderProps) {
  const [inputValue, setInputValue] = useState(value);

  useEffect(() => setInputValue(value), [value]);

  return (
    <Box className='appearance-slider'>
      <Box className='appearance-slider-label'>
        <Typography>{label}</Typography>
        <Typography color='text.secondary'>{inputValue}%</Typography>
      </Box>
      <Slider
        size='small'
        value={inputValue}
        min={0}
        max={100}
        step={5}
        valueLabelDisplay='auto'
        valueLabelFormat={(sliderValue) => `${sliderValue}%`}
        aria-label={label}
        onChange={(_, sliderValue) => setInputValue(sliderValue as number)}
        onChangeCommitted={(_, sliderValue) =>
          onChange?.(sliderValue as number)
        }
      />
    </Box>
  );
}
