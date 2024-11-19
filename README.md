# BIT BIRD README


Welcome to **Bit Bird** - a social media website where you can follow people, text the people you follow, update your profile, and upload posts that consist of images. This project is built using the MERN stack and integrates Cloudinary for image storage.

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Technology Stack](#technology-stack)
4. [Setup and Installation](#setup-and-installation)
5. [Configuration](#configuration)
6. [Usage](#usage)

## Introduction

BIT BIRD is a full-stack web application designed to replicate the core functionalities of Twitter. Users can create accounts, follow other users, send direct messages, update their profiles, and upload image posts. The application is built with the MERN stack (MongoDB, Express, React, Node.js) and utilizes Cloudinary for efficient image management.

## Features

- **User Authentication**: Sign up and log in with secure authentication.
- **Follow System**: Follow and unfollow other users to see their posts in your feed.
- **Direct Messaging**: Send and receive messages from users you follow using Socket.io for real-time communication.
- **Profile Management**: Update your profile information and avatar.
- **Image Posts**: Upload and view posts containing images.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Modern UI**: Styled using Tailwind CSS with DaisyUI components.

## Technology Stack

- **Frontend**: React.js, Tailwind CSS, DaisyUI
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Image Storage**: Cloudinary
- **Authentication**: JWT (JSON Web Tokens)
- **Real-Time Communication**: Socket.io

## Setup and Installation

### Prerequisites

Ensure you have the following installed on your local machine:

- Node.js (v12.x or later)
- npm (v6.x or later)
- MongoDB
- Cloudinary account

### Installation Steps

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Namandas/BIT BIRD/
   cd BIT BIRD
   
2. **Build App:**
   ```bash
   npm run build

### configuration

1. **.env Setup**:
   ```bash
     MONGO_URI =
     PORT =
     JWT_SECRET =
     NODE_ENV = development
     CLOUDINARY_CLOUD_NAME =
     CLOUDINARY_API_KEY =
     CLOUDINARY_API_SECRET =
     EMAIL = enter googleSMTPmail
     EMAIL_PASSWORD = 
     SESSION_SECRET = 

### usage

1. **Running the application:**
  ```bash
  1. npm run dev (For Development)
  2. npm run start (For Production)

