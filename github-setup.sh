#!/bin/bash

echo "========================================="
echo "GitHub Setup Helper"
echo "========================================="
echo ""

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "Please enter your GitHub details:"
echo ""
read -p "GitHub Username: " username
read -p "Repository Name: " reponame

echo ""
echo "Initializing git repository..."
git init

echo "Adding files..."
git add .

echo "Creating initial commit..."
git commit -m "Initial commit: Machine Resale Calculator with Docker deployment"

echo "Adding remote repository..."
git remote add origin "https://github.com/$username/$reponame.git"

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

echo ""
echo "========================================="
echo "✅ Done! Your code is now on GitHub"
echo "========================================="
echo ""
echo "Repository URL: https://github.com/$username/$reponame"
echo ""
