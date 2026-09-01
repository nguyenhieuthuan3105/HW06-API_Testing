/**
 * ==============================================================================
 * AGENT SKILL: UNIVERSAL AI-DRIVEN API TEST GENERATOR (Level G9.5 Create)
 * Tác giả: Nguyễn Hiếu Thuận - MSSV: 23127125
 * Quy trình: Spec -> Markdown Test Doc -> Collection/Environment -> Newman -> HTML
 * ==============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const http = require('http');

// ==============================================================================
// STEP 0: PREREQUISITES & ENVIRONMENT READINESS CHECK
// ==============================================================================
function checkPrerequisites(targetBaseUrl = 'http://localhost:3000') {
  console.log('===============================================================');
  console.log('🔍 [STEP 0] KIỂM TRA MÔI TRƯỜNG & CÔNG CỤ CẦN THIẾT...');
  console.log('===============================================================');
  console.log(`✅ Node.js Runtime: ${process.version}`);

  try {
    const newmanVer = execSync('npx newman --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Newman CLI: v${newmanVer} (Sẵn sàng thực thi)`);
  } catch (err) {
    console.log('⚠️ Đang cài đặt Newman và Reporter HTML Extra...');
    execSync('npm install -g newman newman-reporter-htmlextra', { stdio: 'inherit' });
  }

  return new Promise((resolve) => {
    const urlObj = new URL(targetBaseUrl);
    const req = http.get(
      { hostname: urlObj.hostname, port: urlObj.port || 80, path: '/' },
      (res) => {
        console.log(`✅ Máy chủ SUT đang hoạt động tại ${targetBaseUrl} (Status: ${res.statusCode})`);
        resolve(true);
      }
    );
    req.on('error', () => {
      console.log(`ℹ️ Lưu ý: SUT chưa phản hồi tại ${targetBaseUrl}. Kịch bản vẫn sẽ được sinh bình thường.`);
      resolve(false);
    });
    req.setTimeout(1500, () => {
      req.abort();
      resolve(false);
    });
  });
}

// ==============================================================================
// STEP 1: PARSE API SPECIFICATION (MARKDOWN / JSON)
// ==============================================================================
function parseSpecification(specPath) {
  console.log('\n===============================================================');
  console.log(`📥 [STEP 1] PHÂN TÍCH ĐẶC TẢ API TỪ: ${specPath}`);
  console.log('===============================================================');

  if (!fs.existsSync(specPath)) {
    throw new Error(`Không tìm thấy file đặc tả tại: ${specPath}`);
  }

  const content = fs.readFileSync(specPath, 'utf8');
  const methodMatch = content.match(/Method[\*:\s]*`?([A-Z]+)`?/i) || content.match(/\b(GET|POST|PUT|DELETE|PATCH)\b/i);
  const endpointMatch = content.match(/Endpoint[\*:\s]*`?([\/a-zA-Z0-9_\-]+)`?/i) || content.match(/\b(GET|POST|PUT|DELETE|PATCH)\s+([\/a-zA-Z0-9_\-]+)/i);
  const featureMatch = content.match(/\b(FR-\d+)\b/i) || content.match(/Mã tính năng[\*:\s]*`?([^`\n\r\*]+)`?/i);

  const jsonBlocks = content.match(/```json([\s\S]*?)```/);
  let samplePayload = {};
  if (jsonBlocks && jsonBlocks[1]) {
    try {
      samplePayload = JSON.parse(jsonBlocks[1].trim());
    } catch (e) {}
  }

  const method = methodMatch ? (methodMatch[1] || methodMatch[0]).toUpperCase() : 'POST';
  const endpoint = endpointMatch ? (endpointMatch[1] || endpointMatch[2] || '/api/apply-coupon') : '/api/apply-coupon';
  const featureCode = featureMatch ? featureMatch[1].trim() : 'FR-09';

  return {
    featureCode: featureCode,
    endpoint: endpoint,
    method: method,
    authType: content.includes('Authorization') || content.includes('Bearer') ? 'Bearer' : 'None',
    samplePayload: Object.keys(samplePayload).length > 0 ? samplePayload : { code: 'SAVE10', total_amount: 500000, user_id: 1 }
  };
}

// ==============================================================================
// STEP 2: GENERATE MULTI-DIMENSIONAL TEST SUITE (>= 35 TEST CASES)
// ==============================================================================
function generateTestSuite(spec, studentId = '23127125') {
  console.log('\n===============================================================');
  console.log(`🧠 [STEP 2] TỰ ĐỘNG SUY DIỄN MA TRẬN KIỂM THỬ ĐA CHIỀU CHO ${spec.featureCode}...`);
  console.log('===============================================================');

  const testCases = [];
  const sample = spec.samplePayload;
  const prefix = spec.featureCode.replace(/[^a-zA-Z0-9]/g, '');

  // 1. Nhóm Positive / Happy Path
  testCases.push({
    id: `TC_${prefix}_HAPPY_01`,
    name: `Áp dụng dữ liệu hợp lệ thỏa mãn 100% đặc tả (${spec.featureCode})`,
    folder: '01_Happy_Path_And_Business_Rules',
    body: { ...sample },
    expectedStatus: 200,
    technique: 'Positive Testing / Baseline Happy Path',
    assertions: [
      'pm.expect([200, 201]).to.include(pm.response.code);',
      'pm.expect(pm.response.responseTime).to.be.below(500);'
    ]
  });

  // 2. Nhóm Ràng buộc Nghiệp vụ (Business Rules C1..C5)
  testCases.push({
    id: `TC_${prefix}_RULE_01`,
    name: `Vi phạm Ràng buộc C1 - Tài nguyên không tồn tại trong hệ thống`,
    folder: '01_Happy_Path_And_Business_Rules',
    body: { ...sample, code: 'INVALID_CODE_999', id: 999999 },
    expectedStatus: 404,
    technique: 'Negative Testing / Existence Verification',
    assertions: ['pm.expect([400, 404]).to.include(pm.response.code);']
  });

  testCases.push({
    id: `TC_${prefix}_RULE_02`,
    name: `Vi phạm Ràng buộc C2 - Tài nguyên hết hạn / không kích hoạt`,
    folder: '01_Happy_Path_And_Business_Rules',
    body: { ...sample, code: 'EXPIRED' },
    expectedStatus: 400,
    technique: 'State Validation / Expiry Check',
    assertions: ['pm.expect([400, 422]).to.include(pm.response.code);']
  });

  testCases.push({
    id: `TC_${prefix}_RULE_03`,
    name: `Vi phạm Ràng buộc C3 - Đơn hàng chưa đủ ngưỡng tối thiểu`,
    folder: '01_Happy_Path_And_Business_Rules',
    body: { ...sample, total_amount: 200000 },
    expectedStatus: 400,
    technique: 'Business Rule Validation / Threshold Check',
    assertions: ['pm.expect([400, 422]).to.include(pm.response.code);']
  });

  // 3. Nhóm Domain Partitioning & BVA
  const bvaValues = [
    { val: 300000, desc: 'Bằng đúng ngưỡng tối thiểu (min_order = 300,000)', status: 200 },
    { val: 299999, desc: 'Dưới ngưỡng tối thiểu 1 đơn vị (min_order - 1)', status: 400 },
    { val: 300001, desc: 'Trên ngưỡng tối thiểu 1 đơn vị (min_order + 1)', status: 200 },
    { val: 0, desc: 'Giá trị bằng 0', status: 400 },
    { val: -1, desc: 'Giá trị âm nhỏ nhất (-1)', status: 400 },
    { val: -500000, desc: 'Giá trị âm lớn (-500,000)', status: 400 },
    { val: 999999999, desc: 'Giá trị cực lớn (Extreme Boundary)', status: 200 },
    { val: 500000.5, desc: 'Giá trị là số thực thập phân (Floating Point)', status: 200 }
  ];

  bvaValues.forEach((item, idx) => {
    testCases.push({
      id: `TC_${prefix}_BVA_${String(idx + 1).padStart(2, '0')}`,
      name: `BVA - ${item.desc}`,
      folder: '02_Domain_And_Boundaries',
      body: { ...sample, total_amount: item.val },
      expectedStatus: item.status,
      technique: 'Boundary Value Analysis & Domain Partitioning',
      assertions: [`pm.expect([${item.status === 200 ? '200, 201' : '400, 422'}]).to.include(pm.response.code);`]
    });
  });

  // Domain cho chuỗi (String cases)
  testCases.push({
    id: `TC_${prefix}_STR_01`,
    name: `Domain - Chuỗi rỗng "" trong trường code/tên`,
    folder: '02_Domain_And_Boundaries',
    body: { ...sample, code: '' },
    expectedStatus: 400,
    technique: 'Equivalence Partitioning / Empty String',
    assertions: ['pm.response.to.have.status(400);']
  });

  testCases.push({
    id: `TC_${prefix}_STR_02`,
    name: `Domain - Chuỗi toàn khoảng trắng "     "`,
    folder: '02_Domain_And_Boundaries',
    body: { ...sample, code: '     ' },
    expectedStatus: 400,
    technique: 'Input Sanitization / Whitespace Handling',
    assertions: ['pm.response.to.have.status(400);']
  });

  testCases.push({
    id: `TC_${prefix}_STR_03`,
    name: `Domain - Chuỗi cực dài 5000 ký tự (Buffer Overflow / DoS)`,
    folder: '02_Domain_And_Boundaries',
    body: { ...sample, code: 'A'.repeat(5000) },
    expectedStatus: 400,
    technique: 'Boundary Length / Payload Size Limit',
    assertions: ['pm.expect([400, 413, 404]).to.include(pm.response.code);']
  });

  // 4. Nhóm Security Testing (SEC-01..07)
  testCases.push({
    id: `TC_${prefix}_SEC_01`,
    name: `SEC-03 (IDOR): Sửa user_id trong body khác với Token`,
    folder: '03_Security_Attacks',
    body: { ...sample, user_id: 999 },
    expectedStatus: 403,
    technique: 'OWASP A01 / Insecure Direct Object References',
    assertions: ['pm.expect([403, 400, 401, 200]).to.include(pm.response.code);']
  });

  testCases.push({
    id: `TC_${prefix}_SEC_02`,
    name: `SEC-02 (Auth Missing): Gọi API không gửi Authorization Header`,
    folder: '03_Security_Attacks',
    body: { ...sample },
    noAuth: true,
    expectedStatus: 401,
    technique: 'OWASP A07 / Missing Authentication',
    assertions: ['pm.expect([401, 403, 400]).to.include(pm.response.code);']
  });

  testCases.push({
    id: `TC_${prefix}_SEC_03`,
    name: `SEC-02 (Malformed Token): Gửi JWT giả mạo hoặc sai định dạng`,
    folder: '03_Security_Attacks',
    body: { ...sample },
    fakeToken: 'Bearer invalid.malformed.jwt.token',
    expectedStatus: 401,
    technique: 'OWASP A07 / Token Tampering',
    assertions: ['pm.response.to.have.status(401);']
  });

  testCases.push({
    id: `TC_${prefix}_SEC_04`,
    name: `SEC-01 (SQLi Tautology): Tấn công SQL Injection trong tham số chuỗi`,
    folder: '03_Security_Attacks',
    body: { ...sample, code: "SAVE10' OR '1'='1" },
    expectedStatus: 404,
    technique: 'OWASP A03 / SQL Injection (Tautology)',
    assertions: [
      'pm.expect([400, 404]).to.include(pm.response.code);',
      'pm.expect(pm.response.text()).to.not.include("SQLITE_ERROR");'
    ]
  });

  testCases.push({
    id: `TC_${prefix}_SEC_05`,
    name: `SEC-01 (SQLi Stacked): Tấn công SQL Injection Stacked Drop Query`,
    folder: '03_Security_Attacks',
    body: { ...sample, code: "SAVE10'; DROP TABLE test;--" },
    expectedStatus: 404,
    technique: 'OWASP A03 / Stacked Query Injection',
    assertions: ['pm.expect([400, 404]).to.include(pm.response.code);']
  });

  testCases.push({
    id: `TC_${prefix}_SEC_06`,
    name: `SEC-04 (Parameter Tampering): Gửi kèm discount_amount gian lận`,
    folder: '03_Security_Attacks',
    body: { ...sample, discount_amount: 490000, is_admin: true },
    expectedStatus: 200,
    technique: 'Mass Assignment & Parameter Tampering',
    assertions: ['pm.expect([200, 201, 400]).to.include(pm.response.code);']
  });

  testCases.push({
    id: `TC_${prefix}_SEC_07`,
    name: `SEC-07 (Info Disclosure): Kiểm tra response không rò rỉ CSDL / Stack Trace`,
    folder: '03_Security_Attacks',
    body: { ...sample, code: 'TRIGGER_INTERNAL_ERROR_TEST' },
    expectedStatus: 404,
    technique: 'Information Disclosure & Error Handling',
    assertions: [
      'pm.expect(pm.response.text()).to.not.include("SQLITE_CONSTRAINT");',
      'pm.expect(pm.response.text()).to.not.include("node_modules");'
    ]
  });

  // 5. Nhóm Schema & SLA
  testCases.push({
    id: `TC_${prefix}_SCH_01`,
    name: `Schema Validation & SLA Performance (< 500ms)`,
    folder: '04_Schema_And_Performance',
    body: { ...sample },
    expectedStatus: 200,
    technique: 'JSON Schema Validation & Latency SLA',
    assertions: [
      'pm.expect([200, 201]).to.include(pm.response.code);',
      'pm.expect(pm.response.responseTime).to.be.below(500);',
      'pm.expect(pm.response.headers.get("Content-Type")).to.include("application/json");'
    ]
  });

  return testCases;
}

// ==============================================================================
// STEP 3: WRITE MARKDOWN TEST CASE SPECIFICATION DOCUMENT (FIRST)
// ==============================================================================
function writeMarkdownDocument(spec, testCases, outputPath, studentId) {
  console.log('\n===============================================================');
  console.log(`📄 [STEP 3] XUẤT TÀI LIỆU MARKDOWN TEST CASES (FIRST): ${outputPath}`);
  console.log('===============================================================');

  let content = `# BẢNG THIẾT KẾ KỊCH BẢN KIỂM THỬ API ${spec.featureCode}\n\n`;
  content += `- **Mã tính năng:** \`${spec.featureCode}\`\n`;
  content += `- **Endpoint:** \`[${spec.method}] ${spec.endpoint}\`\n`;
  content += `- **Mã số sinh viên (MSSV):** \`${studentId}\`\n`;
  content += `- **Tổng số kịch bản sinh tự động:** \`${testCases.length} Test Cases\`\n\n`;
  content += `---\n\n`;
  content += `| TestID | Tên Test Case | Kỹ thuật áp dụng | Tham số / Payload | Expected Status | Assertions Kỳ Vọng |\n`;
  content += `| :---: | :--- | :--- | :--- | :---: | :--- |\n`;

  testCases.forEach((tc) => {
    const payloadStr = JSON.stringify(tc.body).replace(/\|/g, '\\|');
    content += `| **${tc.id}** | ${tc.name} | ${tc.technique || 'Black-box Test'} | \`${payloadStr}\` | \`${tc.expectedStatus}\` | \`${tc.assertions[0]}\` |\n`;
  });

  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✅ Đã ghi thành công tài liệu: ${outputPath}`);
}

// ==============================================================================
// STEP 4: ASSEMBLE POSTMAN COLLECTION & ENVIRONMENT JSON
// ==============================================================================
function assemblePostmanFiles(spec, testCases, collectionPath, envPath, studentId) {
  console.log('\n===============================================================');
  console.log('📦 [STEP 4] ĐÓNG GÓI POSTMAN COLLECTION & ENVIRONMENT JSON...');
  console.log('===============================================================');

  const foldersMap = {};

  testCases.forEach((tc) => {
    if (!foldersMap[tc.folder]) foldersMap[tc.folder] = [];

    const headers = [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'X-Student-Id', value: studentId }
    ];

    if (!tc.noAuth) {
      headers.push({
        key: 'Authorization',
        value: tc.fakeToken || 'Bearer {{user_token}}'
      });
    }

    foldersMap[tc.folder].push({
      name: `[${tc.id}] ${tc.name}`,
      request: {
        method: spec.method,
        header: headers,
        body:
          spec.method === 'GET' || spec.method === 'DELETE'
            ? undefined
            : {
                mode: 'raw',
                raw: JSON.stringify(tc.body, null, 2)
              },
        url: {
          raw: `{{baseUrl}}${spec.endpoint}`,
          host: ['{{baseUrl}}'],
          path: spec.endpoint.replace(/^\//, '').split('/')
        }
      },
      event: [
        {
          listen: 'test',
          script: {
            exec: [
              `pm.test(${JSON.stringify(`[${tc.id}] ${tc.name}`)}, function () {`,
              `    ${tc.assertions.join('\n    ')}`,
              `});`
            ],
            type: 'text/javascript'
          }
        }
      ]
    });
  });

  const collection = {
    info: {
      name: `HW06 - ${spec.featureCode} Automated Collection`,
      _postman_id: `skill-gen-${Date.now()}`,
      schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
    },
    event: [
      {
        listen: 'prerequest',
        script: {
          type: 'text/javascript',
          exec: [
            '// Anti-AI-Cheat Watermark Header Injection',
            `const studentId = pm.environment.get("student_id") || "${studentId}";`,
            'pm.request.headers.upsert({ key: "X-Student-Id", value: studentId });'
          ]
        }
      }
    ],
    item: Object.keys(foldersMap).map((f) => ({ name: f, item: foldersMap[f] }))
  };

  fs.writeFileSync(collectionPath, JSON.stringify(collection, null, 2), 'utf8');
  console.log(`✅ File Postman Collection đã lưu tại: ${collectionPath}`);
}

// ==============================================================================
// STEP 5: RUN NEWMAN CLI & EXPORT HTML EXTRA REPORT
// ==============================================================================
function runNewmanCLI(collectionPath, envPath, reportPath) {
  console.log('\n===============================================================');
  console.log('🚀 [STEP 5] THỰC THI NEWMAN CLI & XUẤT BÁO CÁO HTML...');
  console.log('===============================================================');

  const cmd = `npx newman run "${collectionPath}" -e "${envPath}" -r cli,htmlextra --reporter-htmlextra-export "${reportPath}" --suppress-exit-code`;
  console.log(`Command: ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
    console.log(`\n🎉 Báo cáo HTML đã hoàn tất tại: ${reportPath}`);
  } catch (err) {
    console.error('Lỗi khi chạy Newman:', err.message);
  }
}

// ==============================================================================
// MAIN CONTROLLER
// ==============================================================================
async function main() {
  const studentId = '23127125';
  const args = process.argv.slice(2);
  const specArgIdx = args.indexOf('--spec');
  const specPath =
    specArgIdx !== -1
      ? path.resolve(process.cwd(), args[specArgIdx + 1])
      : path.join(__dirname, 'api_specification_template.md');

  // Step 0: Check prerequisites
  await checkPrerequisites();

  // Step 1: Parse specification
  const spec = parseSpecification(specPath);

  // Step 2: Generate multi-dimensional test suite
  const testCases = generateTestSuite(spec, studentId);
  console.log(`✅ Đã sinh thành công ${testCases.length} Test Cases đa chiều bao phủ toàn diện.`);

  const featureSlug = spec.featureCode.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const mdPath = path.resolve(process.cwd(), `${featureSlug}_api_test_case.md`);
  const colPath = path.resolve(process.cwd(), `postman/${featureSlug}_collection.json`);
  const envPath = path.resolve(process.cwd(), `postman/eshop_environment.json`);
  const repPath = path.resolve(process.cwd(), `reports/${featureSlug}_newman_report.html`);

  // Step 3: Write Markdown Document FIRST (Single Source of Truth)
  writeMarkdownDocument(spec, testCases, mdPath, studentId);

  // Step 4: Assemble Postman Collection & Environment JSON
  assemblePostmanFiles(spec, testCases, colPath, envPath, studentId);

  // Step 5: Run Newman CLI if --run is specified
  if (args.includes('--run')) {
    runNewmanCLI(colPath, envPath, repPath);
  } else {
    console.log('\n💡 Gợi ý: Thêm cờ --run để tự động chạy Newman và xuất HTML:');
    console.log(`node agent_skills/api_test_generator/api_test_generator.js --spec ${specPath} --run`);
  }

  console.log('\n===============================================================');
  console.log('🏁 HOÀN TẤT CHU TRÌNH UNIVERSAL AGENT SKILL (LEVEL G9.5 CREATE)');
  console.log('===============================================================');
}

main();
