# DV Account Suite - MUonline Server Management

A modern web-based account management system for MUonline private servers with a beautiful dashboard UI, dark mode support, and SQL database integration.

## Features

- 🎨 **Modern UI** - Built with shadcn/ui components and Tailwind CSS
- 🌙 **Dark Mode** - Full dark/light mode support with system preference detection
- 📊 **Dashboard** - Comprehensive overview with statistics and recent activity
- 👥 **Account Management** - Create, edit, delete, and manage player accounts
- 🎮 **Character Management** - View and manage player characters
- 🔍 **Search & Filter** - Advanced search and filtering capabilities
- 🛡️ **Security** - Account status management (active, banned, VIP)
- 📱 **Responsive** - Mobile-friendly design
- 🗄️ **SQL Integration** - Direct MySQL database connectivity

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Database**: MySQL with mysql2
- **Icons**: Lucide React
- **Theme**: next-themes for dark mode

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL database with MUonline tables
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd DV-Account-Suite
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   DB_HOST=192.168.56.1
   DB_USER=root
   DB_PASSWORD=1234
   DB_NAME=muonline
   DB_PORT=3306
   ```
   
   **Note**: The application is configured to connect to a MariaDB database at `192.168.56.1:3306` with the database name `muonline`. Update these values in your `.env.local` file to match your database setup.

4. **Configure your MariaDB database**
   Ensure your MUonline database has the following tables:
   - `accounts` - Account information (with columns: id, username, email, status, vip)
   - `Character` - Character data

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Database Schema

The application expects the following MySQL tables:

### Accounts Table
```sql
CREATE TABLE accounts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100),
  status ENUM('active', 'banned', 'inactive') DEFAULT 'active',
  vip TINYINT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Character Table
```sql
CREATE TABLE Character (
  Name VARCHAR(10) PRIMARY KEY,
  AccountID VARCHAR(10),
  CtlCode TINYINT DEFAULT 0,
  Level INT DEFAULT 1,
  Class TINYINT,
  -- Add other character fields as needed
);
```

## API Endpoints

- `GET /api/accounts` - Get all accounts with pagination
- `GET /api/accounts/[username]` - Get specific account
- `POST /api/accounts` - Create new account
- `PUT /api/accounts/[username]` - Update account
- `DELETE /api/accounts/[username]` - Delete account
- `GET /api/characters` - Get characters by account or stats

## Features Overview

### Dashboard
- Account statistics overview
- Recent activity feed
- Quick action buttons
- System status indicators

### Account Management
- View all accounts in a table format
- Search and filter accounts
- Create new accounts
- Edit account details
- Ban/unban accounts
- VIP status management

### Character Management
- View characters by account
- Character statistics
- Character deletion (with confirmation)

### Security Features
- Account status management
- VIP account identification
- Ban/unban functionality
- Activity logging

## Customization

### Adding New Components
The project uses shadcn/ui components. To add new components:

```bash
npx shadcn@latest add [component-name]
```

### Theming
The application supports light and dark themes. Theme configuration is in `components/theme-provider.tsx`.

### Database Configuration
Database settings can be modified in `lib/database.ts`. The current implementation uses MySQL, but can be adapted for other SQL databases.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue on the GitHub repository.
