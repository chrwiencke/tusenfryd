# Image Assets

This directory contains image assets for the Tusenfryd amusement park application.

## Directory Structure

- `/attractions/` - Attraction images
- `/logos/` - Park logos and branding
- `/backgrounds/` - Background images
- `/icons/` - Custom icons

## Image Guidelines

### Attraction Images
- **Format**: JPG or PNG
- **Size**: 1200x800px (3:2 aspect ratio preferred)
- **File size**: Maximum 2MB
- **Naming**: Use lowercase with hyphens (e.g., `speedmonster.jpg`)

### Logos
- **Format**: PNG with transparency
- **Sizes**: Multiple sizes (64x64, 128x128, 256x256)
- **Background**: Transparent

### Background Images
- **Format**: JPG
- **Size**: 1920x1080px minimum
- **Quality**: High quality for hero sections

## Usage

Images are served statically from the `/public/images/` directory and can be referenced in templates using:

```html
<img src="/images/attractions/speedmonster.jpg" alt="SpeedMonster">
```

## Placeholder Images

For development purposes, you can use placeholder images from:
- https://picsum.photos/ (random images)
- https://placeholder.com/ (solid color placeholders)
- https://unsplash.com/ (high-quality photos)

Example placeholder usage:
```html
<img src="https://picsum.photos/1200/800?random=1" alt="Attraction">
```
