# VidProof – AI-Powered CCTV Video Authenticity Checker

VidProof is a modern web application designed to analyze video files and generate detailed authenticity reports. Users can upload video footage, and the application performs a client-side analysis to detect potential signs of tampering, providing a comprehensive summary, an authenticity score, and a list of specific findings.

 ![image](https://github.com/user-attachments/assets/26ccea0d-b1e9-4c33-a9c4-a529f62fb880)

 <h1 align="center">
  <a href="https://vid-proof.vercel.app"><strong>Live Demo</strong></a>  
  </h1>


## ✨ Features

*   **Secure User Authentication**: Sign up, log in, and password reset functionality powered by Supabase Auth.
*   **Client-Side Video Analysis**: All analysis is performed directly in the browser using FFmpeg (compiled to WebAssembly), ensuring user privacy as videos are never uploaded to a server.
*   **Comprehensive Reports**: Each analysis generates a detailed report including:
    *   An **Authenticity Score** (0-100) visualized in a dynamic circular progress bar.
    *   A clear, concise **Summary** of the findings.
    *   A **Detailed List of Issues** with timestamps and severity levels (low, medium, high).
*   **In-Depth Analysis Checks**:
    *   **Metadata Inspection**: Verifies video duration and stream information.
    *   **Frame Comparison**: Extracts frames from different points in the video and compares them to detect static or unnaturally similar segments.
    *   **Audio Analysis**: Detects the presence of an audio stream and identifies periods of silence that could indicate editing.
*   **Persistent Report History**: All generated reports are saved to the user's account and can be accessed anytime from the "My Reports" page.
*   **PDF Export**: Download any report as a professionally formatted PDF document for offline access or sharing.
*   **Responsive Design**: A clean, modern, and fully responsive user interface built with Tailwind CSS and shadcn/ui, providing a seamless experience on both desktop and mobile devices.
*   **User Profile Management**: Users can view and update their personal information.

## 🛠️ Tech Stack

This project is built with a modern, client-centric technology stack.

*   **Frontend**:
    *   **Framework**: React (with Vite)
    *   **Language**: TypeScript
    *   **Styling**: Tailwind CSS & shadcn/ui
    *   **Routing**: React Router
    *   **Data Fetching**: TanStack Query
*   **Backend-as-a-Service (BaaS)**:
    *   **Provider**: Supabase
    *   **Services**: Authentication, PostgreSQL Database (for user profiles and reports).
*   **Core Libraries**:
    *   **Video Processing**: `ffmpeg.wasm` for in-browser video analysis.
    *   **Image Comparison**: `pixelmatch` for detecting differences between video frames.
    *   **PDF Generation**: `jspdf` and `html2canvas` for creating downloadable reports.
    *   **UI Components**: `lucide-react` for icons.

## ⚙️ How It Works

The video analysis process is unique because it happens entirely on the client-side, prioritizing user privacy and security.

1.  **Upload**: The user selects or drags-and-drops a video file into the application.
2.  **In-Browser Engine**: The application loads the FFmpeg library, compiled to WebAssembly, into the browser.
3.  **Analysis**: FFmpeg runs directly in the browser to perform a series of checks on the video file without uploading it anywhere. This includes extracting metadata, audio streams, and individual frames.
4.  **Report Generation**: Based on the analysis, a JSON report is created, calculating the authenticity score and summarizing all findings.
5.  **Data Persistence**: The generated report is then saved to the Supabase database, linked to the authenticated user's ID.
6.  **Display & Download**: The user is redirected to a detailed report page where they can view the results and download a PDF copy.

## Screenshots of VidProof
### Login Page
![image](https://github.com/user-attachments/assets/1489327d-1f32-4738-8317-2774868d2b90)
### Home Page
![image](https://github.com/user-attachments/assets/2329f7e8-f32a-4ebd-9268-03be120cc4bd)
### Analysis Report
![image](https://github.com/user-attachments/assets/f9ac6797-9fcd-43ef-abfa-accd39858082)
### Report Page
![image](https://github.com/user-attachments/assets/908f7b43-bb79-4475-aea1-b4019f4f6ff9)
### Profile Page
![image](https://github.com/user-attachments/assets/d2d70ec9-6f2d-44d4-8709-38bad3ff5a13)

## 🚀 Getting Started

To run this project locally, follow these steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/er-abinesh-21/VidProof.git
    cd VidProof
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up Supabase:**
    *   Go to [supabase.com](https://supabase.com) and create a new project.
    *   Navigate to **Project Settings** > **API**.
    *   Find your **Project URL** and **anon (public) key**.
    *   Create a `.env` file in the root of the project and add your Supabase credentials:
        ```
        VITE_SUPABASE_URL=YOUR_SUPABASE_URL
        VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
        ```
    *   In the Supabase dashboard, go to the **SQL Editor** and run the SQL queries needed to create the `profiles` and `reports` tables, along with their respective policies and the `handle_new_user` function. The required schema is based on the application's interactions with the database.

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application should now be running on `http://localhost:8080`.

## 📁 Folder Structure

The project follows a standard React application structure:
.
├── index.html
├── package.json
├── postcss.config.js
├── tailwind.config.ts
├── vite.config.ts
├── eslint.config.js
├── README.md
└── src/
    ├── App.tsx
    ├── globals.css
    ├── main.tsx
    ├── vite-env.d.ts
    ├── components/
    │   ├── MainLayout.tsx
    │   ├── ProfileFormSkeleton.tsx
    │   ├── ReportDisplay.tsx
    │   ├── Sidebar.tsx
    │   ├── UserNav.tsx
    │   ├── VideoUpload.tsx
    │   └── ui/
    │       ├── accordion.tsx
    │       ├── alert-dialog.tsx
    │       ├── alert.tsx
    │       ├── aspect-ratio.tsx
    │       ├── avatar.tsx
    │       ├── badge.tsx
    │       ├── breadcrumb.tsx
    │       ├── button.tsx
    │       ├── calendar.tsx
    │       ├── card.tsx
    │       ├── carousel.tsx
    │       ├── chart.tsx
    │       ├── checkbox.tsx
    │       ├── collapsible.tsx
    │       ├── command.tsx
    │       ├── context-menu.tsx
    │       ├── dialog.tsx
    │       ├── drawer.tsx
    │       ├── dropdown-menu.tsx
    │       ├── form.tsx
    │       ├── hover-card.tsx
    │       ├── input-otp.tsx
    │       ├── input.tsx
    │       ├── label.tsx
    │       ├── menubar.tsx
    │       ├── navigation-menu.tsx
    │       ├── pagination.tsx
    │       ├── popover.tsx
    │       ├── progress.tsx
    │       ├── radio-group.tsx
    │       ├── resizable.tsx
    │       ├── scroll-area.tsx
    │       ├── select.tsx
    │       ├── separator.tsx
    │       ├── sheet.tsx
    │       ├── skeleton.tsx
    │       ├── slider.tsx
    │       ├── sonner.tsx
    │       ├── switch.tsx
    │       ├── table.tsx
    │       ├── tabs.tsx
    │       ├── textarea.tsx
    │       ├── toast.tsx
    │       ├── toaster.tsx
    │       ├── toggle-group.tsx
    │       ├── toggle.tsx
    │       ├── tooltip.tsx
    │       └── use-toast.ts
    ├── hooks/
    │   ├── useAuth.tsx
    │   ├── use-mobile.tsx
    │   └── use-toast.ts
    ├── integrations/
    │   └── supabase/
    │       └── client.ts
    ├── lib/
    │   ├── utils.ts
    │   └── video-analyzer.ts
    ├── pages/
    │   ├── Index.tsx
    │   ├── Login.css
    │   ├── Login.tsx
    │   ├── NotFound.tsx
    │   ├── Profile.tsx
    │   ├── ReportDetail.tsx
    │   └── Reports.tsx
    ├── types/
    │   └── index.ts
    └── utils/
        └── toast.ts

## ©️ License

Distributed under the MIT License. See `LICENSE` for more information.

