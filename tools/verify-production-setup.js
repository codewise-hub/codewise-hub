#!/usr/bin/env node

/**
 * Complete Production Setup Verifier
 * Checks Vercel deployment, database connection, and readiness for course import
 */

async function verifyProductionSetup(vercelUrl) {
  console.log('Production Setup Verification');
  console.log('============================');
  console.log(`Target: ${vercelUrl}\n`);
  
  const results = {
    webApp: false,
    database: false,
    apiEndpoints: false,
    readyForImport: false
  };
  
  // Test 1: Web Application
  console.log('1. Testing web application...');
  try {
    const response = await fetch(vercelUrl);
    if (response.ok) {
      console.log('   ✅ Web app is live and accessible');
      results.webApp = true;
    } else {
      console.log(`   ❌ Web app returned status ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ Cannot reach web application');
    console.log(`   Error: ${error.message}`);
  }
  
  // Test 2: Database Connection via API
  console.log('\\n2. Testing database connection...');
  try {
    const response = await fetch(`${vercelUrl}/api/courses`);
    if (response.ok) {
      const courses = await response.json();
      console.log('   ✅ Database connection working');
      console.log(`   📚 Found ${courses.length} courses in database`);
      results.database = true;
      results.apiEndpoints = true;
      
      if (courses.length > 0) {
        console.log('   ✨ Database already has content!');
        results.readyForImport = true;
      }
    } else if (response.status === 500) {
      console.log('   ❌ Database connection failed (500 error)');
      console.log('   💡 Check DATABASE_URL in Vercel environment variables');
    } else {
      console.log(`   ⚠️  Unexpected response: ${response.status}`);
    }
  } catch (error) {
    console.log('   ❌ API endpoint not accessible');
  }
  
  // Test 3: Import Endpoint
  if (results.apiEndpoints) {
    console.log('\\n3. Testing import endpoint...');
    try {
      const response = await fetch(`${vercelUrl}/api/import-courses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true })
      });
      
      if (response.status === 400 || response.status === 200) {
        console.log('   ✅ Import endpoint is responding');
      } else if (response.status === 500) {
        console.log('   ❌ Import endpoint has issues');
      }
    } catch (error) {
      console.log('   ⚠️  Could not test import endpoint');
    }
  }
  
  // Summary and Next Steps
  console.log('\\n📋 Setup Status Summary:');
  console.log(`   Web Application: ${results.webApp ? '✅ Working' : '❌ Issues'}`);
  console.log(`   Database Connection: ${results.database ? '✅ Working' : '❌ Issues'}`);
  console.log(`   API Endpoints: ${results.apiEndpoints ? '✅ Working' : '❌ Issues'}`);
  
  console.log('\\n🎯 Next Steps:');
  
  if (!results.webApp) {
    console.log('   1. Check Vercel deployment status');
    console.log('   2. Verify your Vercel URL is correct');
  } else if (!results.database) {
    console.log('   1. Set up Neon database integration');
    console.log('   2. Add DATABASE_URL to Vercel environment variables');
    console.log('   3. Run: npm run db:push to create database schema');
    console.log('   4. Redeploy your Vercel application');
  } else if (!results.readyForImport) {
    console.log('   ✨ Ready to import courses! Run:');
    console.log(`   node tools/deploy-to-production.js ${vercelUrl}`);
  } else {
    console.log('   🎉 Everything is set up and working perfectly!');
    console.log(`   Visit: ${vercelUrl}/admin to view your courses`);
  }
}

async function main() {
  const vercelUrl = process.argv[2];
  
  if (!vercelUrl) {
    console.error('Usage: node tools/verify-production-setup.js <VERCEL_URL>');
    console.error('Example: node tools/verify-production-setup.js https://codewise-hub.vercel.app');
    process.exit(1);
  }
  
  await verifyProductionSetup(vercelUrl.replace(/\/$/, ''));
}

main().catch(console.error);