# Image Processing Feature

This document describes the image processing functionality implemented in the Adiva AI chat application.

## Components

### 1. ImageUploader Component (`ImageUploader.tsx`)
A reusable React component for handling image uploads with preview functionality.

**Features:**
- Image file validation (type and size)
- Image preview with remove option
- Loading states during processing
- Responsive design with glass morphism effects

**Props:**
- `onImageSelect`: Callback when image is selected
- `onImageRemove`: Callback when image is removed
- `selectedImage`: Currently selected image file
- `imagePreview`: Base64 preview URL
- `isUploading`: Loading state
- `disabled`: Disable the component
- `className`: Additional CSS classes

### 2. useImageProcessing Hook (`useImageProcessing.ts`)
A custom React hook for managing image processing state.

**State:**
- `selectedImage`: Currently selected image file
- `imagePreview`: Base64 preview URL
- `isUploading`: Loading state

**Actions:**
- `handleImageSelect`: Select and preview image
- `handleImageRemove`: Remove selected image
- `setUploading`: Set loading state
- `reset`: Reset all state

### 3. ImageProcessingService (`imageProcessingService.ts`)
Service class for handling image processing API calls.

**Methods:**
- `processImage()`: Main method with fallback support
- `processImageWithAI()`: Direct image processing endpoint
- `processImageWithFallback()`: Fallback using regular chat API
- `validateImage()`: Image file validation

## Backend Integration

### API Endpoint: `/api/chat-with-image`
- **Method**: POST
- **Content-Type**: multipart/form-data
- **Body**: 
  - `image`: Image file
  - `message`: Text prompt
  - `systemPrompt`: System instructions
  - `conversationId`: Chat session ID
  - `modelId`: AI model to use

### Features:
- Uses OpenAI's GPT-4 Vision model
- Supports up to 10MB image files
- Automatic image format validation
- Conversation history integration
- Analytics tracking

## Usage

### Basic Image Upload
```tsx
import ImageUploader from './ImageUploader';
import { useImageProcessing } from '@/hooks/useImageProcessing';

function MyComponent() {
  const {
    selectedImage,
    imagePreview,
    isUploading,
    handleImageSelect,
    handleImageRemove,
    setUploading,
    reset
  } = useImageProcessing();

  return (
    <ImageUploader
      onImageSelect={handleImageSelect}
      onImageRemove={handleImageRemove}
      selectedImage={selectedImage}
      imagePreview={imagePreview}
      isUploading={isUploading}
    />
  );
}
```

### Image Processing
```tsx
import { ImageProcessingService } from '@/services/imageProcessingService';

const processImage = async (imageFile: File, message: string) => {
  try {
    const response = await ImageProcessingService.processImage({
      image: imageFile,
      message: message,
      systemPrompt: "You are a helpful AI assistant...",
      conversationId: "chat_123",
      modelId: "gpt-4o-mini"
    });
    
    console.log(response.reply);
  } catch (error) {
    console.error('Image processing failed:', error);
  }
};
```

## Supported Features

- **File Types**: JPG, PNG, GIF, WebP, BMP, TIFF
- **File Size**: Up to 10MB
- **AI Models**: GPT-4o-mini (with vision capabilities)
- **Image Analysis**: Object detection, scene description, text extraction
- **Combined Input**: Text + Image prompts
- **Real-time Preview**: Image preview before sending
- **Error Handling**: Comprehensive error handling and fallbacks

## Error Handling

The system includes multiple layers of error handling:

1. **Client-side validation**: File type and size validation
2. **Network errors**: Automatic retry with fallback
3. **API errors**: Graceful degradation to text-only mode
4. **User feedback**: Clear error messages and loading states

## Future Enhancements

- Support for multiple images
- Image editing capabilities
- OCR (Optical Character Recognition)
- Image generation based on descriptions
- Video processing support
- Advanced image analysis (emotions, objects, etc.)
