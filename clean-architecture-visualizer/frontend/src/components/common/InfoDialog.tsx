import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Typography, 
  IconButton, 
  Box, 
  Button
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CloseIcon from '@mui/icons-material/Close';

interface InfoDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  content: React.ReactNode;
  buttonText?: string;
  onButtonClick?: () => void;
}

const InfoDialog = ({ 
  open, 
  onClose, 
  title, 
  content, 
  buttonText = "Close", 
  onButtonClick 
}: InfoDialogProps) => {

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        sx: { 
          borderRadius: 4, 
          p: 2,
          bgcolor: 'background.paper' 
        }
      }}
    >
      <IconButton
        onClick={onClose}
        aria-label="Close"
        sx={{ 
          position: 'absolute', 
          right: 16, 
          top: 16, 
          color: 'text.secondary' 
        }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ mt: 2 }}>
        <Box display="flex" gap={2} alignItems="flex-start">
          {/* Info Icon using theme secondary text color */}
          <InfoOutlinedIcon sx={{ fontSize: 32, mt: 0.5, color: 'text.secondary' }} />
          
          <Box>
            <Typography variant="h5" fontWeight="bold" gutterBottom>
              {title}
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              {typeof content === 'string' ? (
                <Typography variant="body1" color="text.secondary">
                  {content}
                </Typography>
              ) : (
                content
              )}
            </Box>

            <Button 
              variant="contained" 
              onClick={onButtonClick || onClose}
              sx={{ 
                bgcolor: 'grey.200', 
                color: 'text.primary',
                boxShadow: 'none',
                '&:hover': { 
                    bgcolor: 'grey.300', 
                    boxShadow: 'none' 
                },
                textTransform: 'none',
                fontWeight: '600',
                borderRadius: 2,
                px: 3
              }}
            >
              {buttonText}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;