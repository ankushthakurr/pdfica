# PDF Magic Studio

Act as an expert Senior Full-Stack Engineer, UI/UX Designer, and Software Architect. Your task is to generate a complete, fully functional, and visually stunning clone of iLovePDF (https://www.ilovepdf.com/). The website must be 100% free for users, requiring NO signup, login, or payment.

### 🎨 Design & UI/UX Requirements

- **Aesthetic:** Modern, clean, professional, and visually superior to the original iLovePDF. Use a sleek color palette (Primary: Vibrant PDF Red/Orange `#E53E3E`, Secondary: Deep Slate `#1A202C`, Background: Ultra-clean Light Gray/White `#F7FAFC`).

- **Animations:** Implement smooth, modern Micro-interactions using Tailwind CSS transitions, Framer Motion, or Vanilla CSS Keyframes. Include floating animations for tool cards, smooth hover scaling, sleek loading shimmers (skeleton loaders), and satisfying success checkmark animations.

- **Responsiveness:** 100% mobile-responsive, optimized perfectly for Mobile, Tablet, and Desktop. Use a flexible CSS Grid and Flexbox layout.

- **Navigation:** A sticky, beautiful glassmorphism header with a mega-menu dropdown showcasing "All PDF Tools". A clean, informative footer.

### 🛠️ Core Functionality & PDF Tools

Every tool must be operational directly in the browser (Client-Side) using robust JavaScript libraries (e.g., pdf-lib, pdf.js, docx, etc.). Every tool must feature a "Drag & Drop" zone with beautiful file-upload animations.

Implement the following exact tools:

1.  **Merge PDF:** Combine multiple PDF files into one in the exact order selected.

2.  **Split PDF:** Extract specific page ranges or split all pages into separate PDF files.

3.  **Compress PDF:** Reduce PDF file size while optimizing for maximum quality.

4.  **PDF to Word / Word to PDF:** Clean conversion templates using client-side parsers.

5.  **PDF to JPG / JPG to PDF:** Extract images from a PDF or convert multiple images into a clean PDF document.

6.  **Organize PDF:** Visual grid layout allowing users to drag-and-drop reorder, delete, or rotate individual pages of a PDF before downloading.

7.  **Protect PDF:** Add a secure password encryption layer to the uploaded PDF.

8.  **Unlock PDF:** Remove password protection from a PDF (assuming the user knows the password or it can be decrypted client-side).

### 📄 Structural Pages & Legal Framework

Create a multi-page routing structure (or a highly organized, seamless Single Page Application router) containing:

- **Home Page:** A beautiful hero section with an attention-grabbing tagline, followed by a grid of all PDF tools categorized logically.

- **Tool Workspaces:** Dynamic, clean individual pages for each tool featuring an upload zone, file preview thumbnails, configuration sidebars, and a prominent processing button.

- **Blog Section:** A beautiful modern magazine-style blog layout containing 3 placeholder SEO-optimized articles about "How to edit PDFs", "Benefits of compressing PDFs", etc. These must include strategic internal linking pointing directly to the respective tools to maximize SEO.

- **Legal Pages:** Fully drafted, professional text layouts for:

  - Privacy Policy (emphasizing that files never leave the user's local machine for maximum security).

  - Terms of Service.

  - Contact Us page with a working frontend form.

### 💻 Technical Stack Preference

Please generate this using HTML5, Tailwind CSS for styling, and Vanilla JavaScript (ES6+) or React/Next.js. Ensure all dependencies for PDF processing (like pdf-lib or pdfjs-dist) are imported via reliable, fast CDNs or npm packages. 

Provide the complete, clean, modular code with no placeholders or "todo" comments. I want a ready-to-run, fully animated, working ecosystem.  Webiste name is  pdfica  ANd Domain name is pdfica.in.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://pdfica.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/890a6005-65b9-496f-8f38-fc27ef9e4822).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
