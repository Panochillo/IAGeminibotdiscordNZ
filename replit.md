# Overview

This is a Discord bot integrated with Google's Gemini AI that provides AI-powered text responses and image generation capabilities. The bot uses Discord.js v14 for Discord API interactions and Google's GenAI SDK for AI functionality. It features slash commands for asking questions and generating images, with built-in content moderation and error handling.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Bot Framework
- **Discord.js v14**: Modern Discord API wrapper with full slash command support
- **Node.js**: Runtime environment for the bot application
- **Modular command system**: Commands are stored in separate files and dynamically loaded

## AI Integration
- **Google Gemini AI**: Primary AI service using the official @google/genai SDK
- **Model**: Uses gemini-2.5-flash for text generation and image creation
- **Content filtering**: Basic keyword-based filtering for inappropriate content in image prompts

## Command Architecture
- **Slash commands**: Modern Discord interaction system
- **Command collection**: Uses Discord.js Collection for efficient command storage and retrieval
- **Deferred replies**: Handles long-running AI operations with proper Discord interaction patterns

## Configuration Management
- **Environment variables**: All sensitive data (API keys, tokens) stored in environment variables
- **Centralized config**: Single configuration file with color schemes, rate limits, and AI settings
- **Development/production**: Environment-aware configuration system

## Logging System
- **File-based logging**: Separate log files for general logs and errors
- **Structured logging**: Timestamp and level-based log formatting
- **Error tracking**: Dedicated error logging with stack traces

## File Structure
- **Commands directory**: Modular command files (ask.js, image.js)
- **Utils directory**: Shared utilities (gemini.js, logger.js)
- **Config directory**: Configuration management
- **Logs directory**: Application logging (auto-created)
- **Temp directory**: Temporary file storage for image operations

## Error Handling
- **Graceful degradation**: Proper error responses for AI failures
- **User feedback**: Rich embed messages for errors and success states
- **API error mapping**: Specific error handling for different API failure scenarios

# External Dependencies

## Primary Services
- **Discord API**: Bot hosting and user interaction platform
- **Google Gemini AI**: Text generation and image creation service

## NPM Packages
- **discord.js**: Discord API wrapper and bot framework
- **@google/genai**: Official Google Generative AI SDK

## Required Environment Variables
- **DISCORD_TOKEN**: Bot authentication token from Discord Developer Portal
- **CLIENT_ID**: Discord application/bot client ID
- **GEMINI_API_KEY**: Google AI Studio API key for Gemini access

## File System Dependencies
- **Local file storage**: Temporary directory for image processing
- **Log file management**: Automatic log directory and file creation
- **Dynamic command loading**: File system scanning for command modules