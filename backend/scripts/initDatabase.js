const { sequelize, User, ProductionData, SalesData, BatchCodeData } = require('../models');

async function initializeDatabase() {
  try {
    console.log('� Initializing fresh database...');
    
    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected successfully');

    // Create all tables with proper schema
    await sequelize.sync({ force: true });
    console.log('✅ All tables created successfully');

    // Seed initial users
    const users = [
      {
        username: 'admin',
        password: 'admin123',
        role: 'admin',
        isActive: true
      },
      {
        username: 'raghu',
        password: '5password3',
        role: 'manager',
        isActive: true
      },
      {
        username: 'prakash',
        password: '1password4',
        role: 'employee',
        isActive: true
      }
    ];

    console.log('\n👥 Creating initial users...');
    for (const userData of users) {
      await User.create(userData);
      console.log(`✅ Created user: ${userData.username} (${userData.role})`);
    }

    // Display created users
    const allUsers = await User.findAll({
      attributes: ['username', 'role', 'isActive', 'createdAt']
    });
    
    console.log('\n📋 Initial Users Created:');
    console.table(allUsers.map(user => ({
      Username: user.username,
      Role: user.role,
      Active: user.isActive ? '✅' : '❌',
      Created: user.createdAt.toISOString().split('T')[0]
    })));

    // Verify all tables exist
    const tables = await sequelize.getQueryInterface().showAllTables();
    console.log('\n📊 Database Tables Created:');
    tables.forEach(table => console.log(`  ✅ ${table}`));

    console.log('\n🎉 Database initialization completed successfully!');
    console.log('💡 You can now start the server with: npm start');

  } catch (error) {
    console.error('❌ Error initializing database:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('\n🔒 Database connection closed');
  }
}

// Run the initializer
initializeDatabase();