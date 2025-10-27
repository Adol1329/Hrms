// Role enumeration
export const ERole = {
  User: 'User',
  Admin: 'Admin'
};

// Helper function to get role enum value
export const getRoleEnumValue = (role) => {
  return Object.values(ERole).find(r => r.toLowerCase() === role.toLowerCase());
}; 