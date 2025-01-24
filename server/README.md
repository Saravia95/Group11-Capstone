# 🎵 JukeVibes - Server

This project is the backend for the JukeVibes, an innovative web-based music system that allows customers to browse, request, and play songs via QR codes. The system is designed to enhance customer experience in venues such as restaurants and cafes by offering a seamless digital jukebox experience.

## Pre-requisites

Install [Node.js](https://nodejs.org/en/) version v20.9.0

## Getting Started

- Environment Variables (_If you don't know how to get these, click [here](https://www.notion.so/How-to-Retrieve-Environment-Variables-in-Supabase-185ed17340298079bb1cf9b2f1e5c637?pvs=4)_)

```
SUPABASE_URL=       //The API gateway for your Supabase project
SUPABASE_ANON_KEY=  //The anon key for your Supabase API
DATABASE_URL=       //PostgreSQL connection string
DIRECT_URL=         //Direct PostgreSQL connection string
```

- Install dependencies

```
npm install
```

- Sync database schema

```
npx prisma generate
npx prisma db push
```

- Build and run the project

```
npm run build
npm run start
```
