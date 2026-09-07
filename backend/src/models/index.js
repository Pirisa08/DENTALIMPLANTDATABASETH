import Country from './Country.js';
import Company from './Company.js';
import Level from './Level.js';
import Implant from './Implant.js';
import ImplantMaster from './ImplantMaster.js';
import Brand from './brand.js';
import Blog from './Blog.js';
import OfficialDistributor from './OfficialDistributor.js';
import User from './User.js';
import Feedback from './Feedback.js';
import RefConnectionType from './RefConnectionType.js';
import RefConnectionShape from './RefConnectionShape.js';
import RefDriverShape from './RefDriverShape.js';
import RefBodyShape from './RefBodyShape.js';
import RefApexShape from './RefApexShape.js';
import LoginActivity from './LoginActivity.js';
import UserProfile from './UserProfile.js';

// ===== Implant (custom table) =====
Implant.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Implant.belongsTo(Level, { foreignKey: 'levelId', as: 'level' });
Implant.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });

// ===== ImplantMaster =====
ImplantMaster.belongsTo(Company, {
  foreignKey: 'company_id',
  targetKey: 'id',
  as: 'company',
});

ImplantMaster.belongsTo(Level, {
  foreignKey: 'level_id',
  targetKey: 'id',
  as: 'level',
});

ImplantMaster.belongsTo(Brand, {
  foreignKey: 'brand_id',
  targetKey: 'idbrand',
  as: 'brandInfo',
});

ImplantMaster.belongsTo(RefConnectionType, {
  foreignKey: 'connection_type_id',
  targetKey: 'id',
  as: 'connectionTypeInfo',
});

ImplantMaster.belongsTo(RefConnectionShape, {
  foreignKey: 'connection_shape_id',
  targetKey: 'id',
  as: 'connectionShapeInfo',
});

ImplantMaster.belongsTo(RefDriverShape, {
  foreignKey: 'driver_shape_id',
  targetKey: 'id',
  as: 'driverShapeInfo',
});

ImplantMaster.belongsTo(RefBodyShape, {
  foreignKey: 'body_shape_id',
  targetKey: 'id',
  as: 'bodyShapeInfo',
});

ImplantMaster.belongsTo(RefApexShape, {
  foreignKey: 'apex_shape_id',
  targetKey: 'id',
  as: 'apexShapeInfo',
});

ImplantMaster.belongsTo(OfficialDistributor, {
  foreignKey: 'distributor_id',
  targetKey: 'id',
  as: 'officialDistributorInfo',
});

// ===== OfficialDistributor =====
OfficialDistributor.belongsTo(Country, { foreignKey: 'countryId', as: 'country' });
Country.hasMany(OfficialDistributor, { foreignKey: 'countryId', as: 'distributors' });

// ===== User profile =====
User.hasOne(UserProfile, { foreignKey: 'user_id', as: 'profile' });
UserProfile.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

export {
  Country,
  Company,
  Level,
  Implant,
  ImplantMaster,
  Brand,
  Blog,
  OfficialDistributor,
  User,
  Feedback,
  RefConnectionType,
  RefConnectionShape,
  RefDriverShape,
  RefBodyShape,
  RefApexShape,
  LoginActivity,
  UserProfile,
};