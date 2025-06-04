const bcrypt = require('bcryptjs');

async function testHash() {
  const plainPassword = 'admin123';
  console.log('Testing password hash for:', plainPassword);
  
  // Hash the password using the same method as the seed script
  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(plainPassword, salt);
  
  console.log('Generated hash:', hashedPassword);
  
  // Test the comparison
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  console.log('Hash comparison test:', isMatch);
  
  // Compare with the existing hash from database
  const existingHash = '$2a$12$f0GbQVXnKHqlOaW57pNez.htc29GBthD3ICYy382HIafdIdGgBoCa';
  const matchExisting = await bcrypt.compare(plainPassword, existingHash);
  console.log('Existing hash comparison:', matchExisting);
  
  // Try different variations of the password
  const variations = ['admin123', 'Admin123', 'ADMIN123', 'admin', 'password'];
  
  console.log('\nTesting password variations against existing hash:');
  for (const variant of variations) {
    const result = await bcrypt.compare(variant, existingHash);
    console.log(`"${variant}": ${result}`);
  }
}

testHash();
