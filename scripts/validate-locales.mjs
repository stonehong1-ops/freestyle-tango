import fs from 'fs';
import path from 'path';

const localesDir = './src/locales';
const files = fs.readdirSync(localesDir).filter(f => f.endsWith('.ts') && f !== 'index.ts');

const masterFile = 'ko.ts';
const masterPath = path.join(localesDir, masterFile);

function getObject(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // 1. Strip comments
    content = content.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '');
    
    // 2. Extract object after 'export default'
    const objMatch = content.match(/export\s+default\s+([\s\S]*?);?\s*$/);
    if (!objMatch) throw new Error(`Could not find export default in ${filePath}`);
    
    let body = objMatch[1].trim();
    if (body.endsWith(';')) body = body.slice(0, -1);

    try {
        // Use a Function to evaluate the JS object string
        return new Function(`return (${body})`)();
    } catch (e) {
        throw new Error(`Syntax error in ${filePath}: ${e.message}`);
    }
}

function getAllKeys(obj, prefix = '') {
    let keys = [];
    if (!obj || typeof obj !== 'object') return keys;
    
    for (const key in obj) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
            keys = keys.concat(getAllKeys(obj[key], fullKey));
        } else {
            keys.push(fullKey);
        }
    }
    return keys;
}

console.log(`🔍 로케일 파일 동기화 검증 시작 (기준: ${masterFile})...`);

let masterKeys;
try {
    const masterObj = getObject(masterPath);
    masterKeys = getAllKeys(masterObj);
    console.log(`✅ 기준 파일 로드 완료: ${masterKeys.length}개 키 발견\n`);
} catch (e) {
    console.error(`❌ 기준 파일(${masterFile}) 로드 실패:`, e.message);
    process.exit(1);
}

let totalErrors = 0;

for (const file of files) {
    if (file === masterFile) continue;
    
    try {
        const obj = getObject(path.join(localesDir, file));
        const keys = getAllKeys(obj);
        
        const missing = masterKeys.filter(k => !keys.includes(k));
        const extra = keys.filter(k => !masterKeys.includes(k));
        
        if (missing.length > 0 || extra.length > 0) {
            console.log(`🚩 [${file}] 불일치 발견:`);
            if (missing.length > 0) {
                totalErrors += missing.length;
                console.log(`   - 누락 (${missing.length}): ${missing.slice(0,10).join(', ')}${missing.length > 10 ? '...' : ''}`);
            }
            if (extra.length > 0) {
                totalErrors += extra.length;
                console.log(`   + 미정의 (${extra.length}): ${extra.slice(0,10).join(', ')}${extra.length > 10 ? '...' : ''}`);
            }
        } else {
            console.log(`✅ [${file}]: 동기화 완료`);
        }
    } catch (e) {
        totalErrors++;
        console.log(`💥 [${file}]: 구문 오류! 분석할 수 없습니다.`);
        console.log(`   Error: ${e.message}`);
    }
}

if (totalErrors > 0) {
    console.log(`\n❌ 검증 실패: 총 ${totalErrors}개의 문제가 발견되었습니다.`);
    process.exit(1);
} else {
    console.log(`\n🎉 모든 로케일 파일이 완벽하게 동기화되었습니다!`);
    process.exit(0);
}
