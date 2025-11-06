import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stepper,
  Step,
  StepLabel,
  StepContent,
} from '@mui/material';
import { motion } from 'framer-motion';

interface OnboardingModalProps {
  open: boolean;
  firstName: string;
  onClose: () => void;
}

const steps = [
  {
    label: 'Welcome!',
    description: `Welcome to FuelTrackDB, ${firstName}! 🚗⛽ Find the best fuel stations near you with real-time prices and availability.`,
  },
  {
    label: 'Explore the Map',
    description: 'Use the map to see all nearby fuel stations. Click on markers to view details, prices, and ratings.',
  },
  {
    label: 'Search & Filter',
    description: 'Use the search bar to find stations by name or location. Filter by fuel type (Petrol, Diesel, CNG, EV, LPG) using the left panel.',
  },
  {
    label: 'Navigate & Save',
    description: 'Click "Navigate" to get directions to any station. Save your favorites for quick access later!',
  },
  {
    label: 'Offline Mode',
    description: 'Download maps for offline use. Your favorites and recent stations are always available, even without internet.',
  },
];

const OnboardingModal: React.FC<OnboardingModalProps> = ({ open, firstName, onClose }) => {
  const [activeStep, setActiveStep] = React.useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleFinish = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperComponent={motion.div}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <DialogTitle>
        <Typography variant="h5" component="div">
          Welcome to FuelTrackDB! 🚗⛽
        </Typography>
      </DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} orientation="vertical">
          {steps.map((step, index) => (
            <Step key={step.label}>
              <StepLabel>{step.label}</StepLabel>
              <StepContent>
                <Typography variant="body1" sx={{ mb: 2 }}>
                  {step.description}
                </Typography>
              </StepContent>
            </Step>
          ))}
        </Stepper>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ flex: '1 1 auto' }} />
        {activeStep === steps.length - 1 ? (
          <Button variant="contained" onClick={handleFinish}>
            Get Started!
          </Button>
        ) : (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default OnboardingModal;

