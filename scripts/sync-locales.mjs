import fs from 'fs';
import path from 'path';

const localesDir = './src/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts' && f !== 'ko.ts');

const navObj = `  nav: {
    home: 'Class',
    milonga: 'Milonga',
    stay: 'Stay',
    class: 'Class',
    info: 'Info',
    mypage: 'MyPage',
    membership: 'Info',
    status: 'MyPage',
    lucy: 'Milonga',
    chat: 'Chatting',
    guide: 'Guide',
    classGuide: 'Guide',
    fullSchedule: 'Schedule'
  },`;

const mediaSection = `  startTime: 'Start Time',
  endTime: 'End Time',
  media: {
    title: 'Media',
    type: {
      youtube: 'YouTube',
      demonstration: 'Demo',
      general: 'General'
    },
    filterAll: 'All',
    addBtn: 'Register',
    like: 'Like',
    comment: 'Comment',
    views: 'Views',
    noAccess: 'This is a demonstration video only for class participants.',
    placeholder: {
      title: 'Enter title',
      url: 'YouTube ID or Video URL',
      desc: 'Enter description',
      class: 'Select Class (Optional)',
      comment: 'Leave a comment...'
    },
    uploading: 'Uploading...',
    deleteConfirm: 'Are you sure you want to delete this?',
    saveSuccess: 'Saved successfully.',
    deleteSuccess: 'Deleted successfully.'
  }
};`;

console.log('🚀 Syncing locales...');

files.forEach(file => {
    const filePath = path.join(localesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Update navigation to English
    content = content.replace(/nav:\s*\{[\s\S]*?\},/, navObj);
    
    // 2. Clean up existing suffix (milonga or partial startTime/media)
    // Remove everything from the last common object closing brace onwards
    // Usually common ends with }, then } for the root.
    // We want to replace the last }; or anything after the common block.
    
    // Look for the end of the root object
    content = content.replace(/,\s*milonga:\s*\{[\s\S]*?\}\s*\};?\s*$/, '');
    content = content.replace(/,\s*startTime:\s*[\s\S]*?media:\s*\{[\s\S]*?\}\s*\};?\s*$/, '');
    
    // Replace the terminal }; with the new section
    if (content.trim().endsWith('}')) {
        content = content.trim().replace(/\}$/, `  },\n${mediaSection}`);
    } else if (content.trim().endsWith('};')) {
        content = content.trim().replace(/\};$/, `  },\n${mediaSection}`);
    }

    fs.writeFileSync(filePath, content);
    console.log(`✅ ${file} synced.`);
});

console.log('🎉 All locales synced!');
