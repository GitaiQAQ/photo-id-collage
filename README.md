# Photo ID Collage Application

A professional tool for processing, arranging, and printing photo IDs, helping you save time and costs.

## Introduction

Photo ID Collage is an online application specifically designed for processing, arranging, and printing photo IDs. Through intelligent layout algorithms, you can arrange multiple photo IDs of different sizes on a single sheet of paper for printing, significantly saving paper and printing costs. Whether you're an individual needing various IDs, or a school, company, or photo studio requiring batch processing of photo IDs, this application can meet your needs.

## Core Features

### 1. Flexible Page Size Configuration
- Multiple preset printing paper sizes (A4, A5, Canon Postcard, L size, etc.)
- Support for custom paper sizes to meet special requirements
- Visual preview function for intuitive display of page effects
- Custom configuration saving for convenient future use

### 2. Powerful Photo Upload and Processing
- Support for batch uploading multiple photos
- Selection of different photo ID specifications for each photo (1-inch, 2-inch, small 2-inch, etc.)
- Detailed display of specific dimensions and uses for various photo IDs
- AI-driven background color replacement (white, blue, red, etc.)
- Face recognition and automatic cropping functions

### 3. Precise Photo Cropping
- Cropping frame automatically locks to the selected photo ID ratio to prevent distortion
- Free movement of the cropping frame for precise positioning
- Support for photo zooming for fine adjustment
- Face-centering guidelines to ensure compliance with photo ID standards

### 4. Intelligent Automatic Layout
- Automatic calculation of optimal layout based on page size and photo dimensions
- Adjustable spacing between photos (supports independent horizontal and vertical settings)
- Ant line separation function for subsequent cutting
- Support for multiple layout algorithms to meet different arrangement needs

### 5. High-Quality Export and Printing
- Export of high-resolution images suitable for printing
- Ensuring exported image dimensions exactly match page configuration
- Clean output results without any auxiliary markers
- Support for common image formats (JPG, PNG, etc.)

## Technical Features

### Application of Adapter Pattern
This application employs the Adapter Pattern design in two core functional modules:

1. **Layout Engine**: Through the Adapter Pattern, multiple layout algorithms (grid layout, compact layout, adaptive layout) are implemented, allowing users to switch between different layout strategies with one click.

2. **Image Processing System**: Image processing functions (such as background color replacement) also use the Adapter Pattern, providing an architectural foundation for future expansion of more AI functions (such as face recognition, beauty enhancement, etc.).

This design gives the system high scalability and flexibility, making it easy to adapt to future functional requirements.

### Other Technical Highlights
- Built with React and TypeScript to ensure code quality and type safety
- Responsive design using Tailwind CSS, adapting to desktop and mobile devices
- Precise image processing algorithms ensuring photo IDs meet standards
- High-performance client-side image processing to protect user privacy

## User Guide

### Basic Usage Process
1. **Select Page Size**: Choose or customize printing paper size in the "Page Configuration" tab
2. **Upload Photos**: Upload photos that need processing in the "Upload Photos" tab
3. **Choose Photo ID Specifications**: Select appropriate photo ID dimensions for each photo (such as 1-inch, 2-inch, etc.)
4. **Crop Photos**: Click on a photo to crop, ensuring proper portrait positioning
5. **View Layout Preview**: Check the automatic layout results in the "Layout Preview" tab
6. **Adjust Settings**: Adjust parameters such as margins, layout algorithms, etc. as needed
7. **Export Image**: Click the "Save as Image" button to export the layout result as an image file

### Advanced Feature Usage
- **Background Color Replacement**: Use the background color replacement function in the cropping dialog to switch photo ID background colors with one click
- **Photo Duplication**: Use the photo duplication function to quickly create multiple copies of the same photo
- **Custom Margins**: Set custom margins for the entire page or individual photos
- **Layout Algorithm Switching**: Try different layout algorithms to find the arrangement that best suits your needs

## Installation and Deployment

### System Requirements
- Modern browsers (latest versions of Chrome, Firefox, Safari, Edge, etc.)
- Desktop devices recommended for the best experience (mobile devices also supported)

### Online Usage
Visit our online application: [Photo ID Collage Application](https://a7669dbf7ffa.aime-app.bytedance.net)

### Local Deployment
If you wish to deploy this application in your local environment:

1. Clone the code repository
```bash
git clone [repository address]
```

2. Install dependencies
```bash
cd photo-id-collage
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Build the production version
```bash
npm run build
```

## Future Feature Planning

We plan to add the following features in future versions:

1. **Enhanced AI Functions**:
   - Complete face recognition and automatic cropping functions
   - AI beauty enhancement and photo editing functions
   - Intelligent background removal function

2. **User Experience Improvements**:
   - Project saving and restoration function
   - More photo ID specifications and templates
   - Enhanced batch processing functions

3. **Service Integration**:
   - Online printing service integration
   - Cloud storage and sharing functions

## Frequently Asked Questions

**Q: What photo ID specifications does the application support?**

A: Currently supports common specifications such as 1-inch, 2-inch, small 2-inch, large 1-inch, small 1-inch, with detailed dimension information as follows:

| Name | Physical Size(mm) | Pixel Size(px@300dpi) | Common Uses |
|------|------------------|----------------------|------------|
| 1-inch | 25×35 | 295×413 | ID cards, driver's licenses |
| 2-inch | 35×49 | 413×579 | Passports, visas |
| Small 2-inch | 35×45 | 413×531 | Passports, visas |
| Large 1-inch | 33×48 | 390×567 | Resumes |
| Small 1-inch | 22×32 | 260×378 | Various certificates |

**Q: How can I get the best printing results?**

A: It is recommended to use photo paper of 200g or above, set the printing resolution to 300dpi or higher, and cut according to the ant lines in the application.

**Q: Will my photos be saved on the server?**

A: No. All image processing is done in your browser and will not be uploaded to the server or permanently stored, ensuring your privacy security.

## Project Links

- [Online Application](https://a7669dbf7ffa.aime-app.bytedance.net)
- [Source Code Repository](https://github.com/yourusername/photo-id-collage)
- [Feedback](https://github.com/yourusername/photo-id-collage/issues)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.