const { LinearClient } = require('@linear/sdk');
require('dotenv').config({ path: '.env.local' });

const LINEAR_API_KEY = process.env.LINEAR_API_KEY;
const linearClient = new LinearClient({ apiKey: LINEAR_API_KEY });

async function cleanupIssues() {
    console.log("🧹 Starting Linear issue cleanup...");
    
    try {
        // 1. Fetch all issues starting with 'Vercel Error:'
        const issues = await linearClient.issues({
            filter: { title: { startsWith: 'Vercel Error:' } }
        });

        if (issues.nodes.length === 0) {
            console.log("✅ No issues found with the old title format.");
            return;
        }

        console.log(`🔍 Found ${issues.nodes.length} issues to rename.`);

        for (const issue of issues.nodes) {
            // 2. Extract branch name from description
            // The description may use * or - for bullet points
            const branchMatch = issue.description.match(/[\*-] \*\*Branch:\*\* `(.+?)`/);
            const branchName = branchMatch ? branchMatch[1] : 'unknown';

            const newTitle = `Vercel Error: ${branchName}`;
            
            process.stdout.write(`🔄 Renaming "${issue.title}" -> "${newTitle}"... `);
            
            await linearClient.updateIssue(issue.id, { title: newTitle });
            
            console.log("DONE.");
        }

        console.log("✨ Cleanup completed successfully.");

    } catch (err) {
        console.error("❌ Cleanup failed:");
        console.error(err.message);
    }
}

cleanupIssues();
