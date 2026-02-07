# Knuckles Hyperlinks

Knuckles Hyperlinks is a Chrome extension that allows users to quickly copy the current tab as a ready-to-paste hyperlink, using the page title as the link text.

With a single click on the extension icon, the active tab’s title and URL are copied to the clipboard in hyperlink format, making it ideal for sharing links in chats, documents, and productivity tools.

## Features

One-click copy of the current tab as a hyperlink

Uses the page title as the link text

Clipboard handling compatible with Chrome Manifest V3

Lightweight and fast, with no unnecessary UI

Optional notification feedback after copying

## How It Works

Due to Chrome Manifest V3 restrictions, clipboard access is handled through an Offscreen Document.
The extension workflow is:

User clicks the extension icon

The background service worker retrieves the active tab’s title and URL

An offscreen document is created (if not already available)

The hyperlink is copied to the clipboard using DOM access

This approach follows Chrome’s recommended practices for MV3 extensions.

## Technologies Used

JavaScript

Chrome Extensions API (Manifest V3)

Offscreen Documents

HTML

Installation (Developer Mode)

Clone this repository

Open Chrome and navigate to chrome://extensions

Enable Developer mode

Click Load unpacked

Select the project folder

## Motivation

This project was developed as a practical exercise in:

Chrome extension development

Working with Manifest V3 constraints

Clean refactoring and collaborative version control

Delivering a simple, focused productivity tool


License

This project is licensed under the MIT License.
