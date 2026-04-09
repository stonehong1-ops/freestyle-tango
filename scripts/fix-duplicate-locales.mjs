import fs from 'fs';
import path from 'path';

const localesDir = './src/locales';
const files = ['ja.ts', 'es.ts', 'fr.ts', 'it.ts', 'tr.ts', 'vi.ts', 'zh-CN.ts', 'zh-TW.ts'];

files.forEach(file => {
  const filePath = path.join(localesDir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find all occurrences of '"common": {'
  const pattern = /"common":\s*\{/g;
  const matches = [...content.matchAll(pattern)];
  
  if (matches.length > 1) {
    console.log(`Fixing ${file}: Found ${matches.length} "common" keys.`);
    
    // We want to keep the FIRST one and remove others.
    // Usually the redundant one is the LAST one in these specific files.
    const lastMatchIndex = matches[matches.length - 1].index;
    
    // Find the end of this block. It ends with '  }' before the final '};'
    // Since these files are structured as a single export default { ... };
    // The last block is followed by '};'
    
    const blockEndIndex = content.lastIndexOf('  }');
    if (blockEndIndex > lastMatchIndex) {
      // Find the comma before the block to remove it too if necessary
      // Actually, safest is to find the START of the block and the END of it.
      
      const beforeBlock = content.substring(0, lastMatchIndex);
      const lastCommaIndex = beforeBlock.lastIndexOf(',');
      
      // We want to keep content up to the comma before the last "common" key
      const newContent = content.substring(0, lastCommaIndex) + '\n};';
      
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Successfully cleaned ${file}`);
    } else {
      console.log(`Could not find end of block for ${file}`);
    }
  } else {
    console.log(`No duplicates in ${file}`);
  }
});
