# Lilo & Stitch Message Game

A web app where you can write a private message, generate a unique link, and share it so the recipient can discover the message in the game experience.

## Live App

👉 https://justforus.qzz.io

## Project Overview

This project uses the **KAPLAY game framework** to create an interactive Lilo & Stitch themed experience where users can send personalized messages through a playful game interface.

This project is split into three parts:

- **Landing page** (`message-app/landing`) for writing a message and generating a shareable link.
- **Backend API** (`message-app/backend`) for creating and retrieving messages.
- **Game client** (`myGame`) where the shared message is revealed through gameplay.

### How It Works

1. **Create a Message**: Visit the landing page and write your personalized message
2. **Generate Link**: The system creates a unique shareable link containing your message ID
3. **Share**: Send the link to your recipient
4. **Play & Discover**: The recipient clicks the link and plays through the Lilo & Stitch game to reveal the hidden message

### Technology Stack

- **Frontend Game**: Built with [KAPLAY](https://kaplayjs.com/) - a modern JavaScript game library for creating 2D games
- **Landing Page**: HTML, CSS, and vanilla JavaScript for a lightweight, fast-loading experience
- **Backend API**: Node.js with Express for handling message creation and retrieval
- **Database**: MySQL for persistent message storage
- **Containerization**: Docker Compose orchestrating all services (MySQL, backend, landing page, game client)

## 🎥 Demo Video

[![Watch the demo](https://img.youtube.com/vi/VIDEO_ID/maxresdefault.jpg)](https://youtube.com/watch?v=VIDEO_ID)


## Issues, Feature Requests, and Improvements

If you find a bug or want a new feature, please open an issue in this repository.

- Use **Bug report** issues for problems or broken behavior.
- Use **Feature request** issues for new ideas and enhancements.
- Include clear steps, expected behavior, and screenshots when possible.