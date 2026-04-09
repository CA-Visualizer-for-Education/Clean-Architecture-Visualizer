import React from 'react';
import { 
  Dialog, 
  DialogContent, 
  Typography, 
  IconButton, 
  Box, 
  Button,
  Stack
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
        sx: { borderRadius: 4, p: 1 }
      }}
    >
      <IconButton
        onClick={onClose}
        sx={{ position: 'absolute', right: 16, top: 16, color: 'text.secondary' }}
      >
        <CloseIcon />
      </IconButton>

      <DialogContent sx={{ mt: 1 }}>
        <Stack spacing={3}>
          {/* Header */}
          <Box display="flex" alignItems="center" gap={2}>
            <InfoOutlinedIcon color="primary" sx={{ fontSize: 32 }} />
            <Typography variant="h5" fontWeight="800">
              {title}
            </Typography>
          </Box>
          
          {/* Content - This will now render the HTML from i18n */}
          <Box sx={{ color: 'text.secondary', lineHeight: 1.6 }}>
            {content}
          </Box>

          {/* Action */}
          <Button 
            variant="contained" 
            onClick={onButtonClick || onClose}
            disableElevation
            sx={{ 
              bgcolor: 'grey.200', 
              color: 'text.primary',
              alignSelf: 'flex-start',
              '&:hover': { bgcolor: 'grey.300' },
              textTransform: 'none',
              fontWeight: '700',
              borderRadius: 2,
              px: 4
            }}
          >
            {buttonText}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default InfoDialog;