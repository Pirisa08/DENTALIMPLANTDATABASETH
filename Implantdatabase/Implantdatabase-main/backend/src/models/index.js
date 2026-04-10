// ...existing code...
export { default as Manufacturer } from './Manufacturer.js';
import Country from './Country.js';
import Company from './Company.js';
import Level from './Level.js';
import Implant from './Implant.js';
import Blog from './Blog.js';
import OfficialDistributor from './OfficialDistributor.js';
import User from './User.js';
import Feedback from './Feedback.js';

// Define associations
Implant.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Implant.belongsTo(Level, { foreignKey: 'levelId', as: 'level' });
Implant.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

OfficialDistributor.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });
Country.hasMany(OfficialDistributor, { foreignKey: 'countryId', as: 'distributors' });

export { Country, Company, Level, Implant, Blog, OfficialDistributor, User, Feedback };
