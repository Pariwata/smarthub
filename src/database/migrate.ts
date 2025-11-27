import sequelize from '../config/database';
import { RegulationGroup, ComplianceRiskArea, RiskAssessment } from '../models';

async function migrate() {
  try {
    console.log('Starting database migration...');

    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');

    // Sync models with database
    // { force: true } drops tables if they exist
    // { alter: true } updates tables to match models
    await sequelize.sync({ alter: true });

    console.log('All models were synchronized successfully.');

    // Close connection
    await sequelize.close();
    console.log('Migration completed successfully.');
  } catch (error) {
    console.error('Unable to migrate database:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrate();
}

export default migrate;
