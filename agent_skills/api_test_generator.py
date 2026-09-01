#!/usr/bin/env python3
"""
AI-Driven API Test Generator for EShop SUT (HW06)
Author: Student 23127125
Features Covered: FR-06 (Product Detail), FR-09 (Apply Coupon), FR-17 (Admin Coupon CRUD)
"""

import json
import os
import sys

def create_postman_request_item(name, method, path, headers_dict, body_data, expected_status, assertions_list=None, student_id="23127125"):
    """Tạo một Postman Request Item hoàn chỉnh theo chuẩn schema v2.1.0"""
    headers = [{"key": k, "value": v} for k, v in headers_dict.items()]
    # Bắt buộc đính kèm header chống gian lận
    if not any(h["key"] == "X-Student-Id" for h in headers):
        headers.append({"key": "X-Student-Id", "value": student_id})

    assertions_js = [
        f"pm.test('Status code is {expected_status}', function () {{",
        f"    pm.response.to.have.status({expected_status});",
        "});",
        "pm.test('Response time is acceptable (< 1500ms)', function () {",
        "    pm.expect(pm.response.responseTime).to.be.below(1500);",
        "});"
    ]
    if assertions_list:
        assertions_js.extend(assertions_list)

    item = {
        "name": name,
        "request": {
            "method": method,
            "header": headers,
            "url": {
                "raw": "{{baseUrl}}" + path,
                "host": ["{{baseUrl}}"],
                "path": [p for p in path.split("?")[0].split("/") if p]
            }
        },
        "event": [
            {
                "listen": "test",
                "script": {
                    "exec": assertions_js,
                    "type": "text/javascript"
                }
            }
        ]
    }

    if body_data is not None:
        item["request"]["body"] = {
            "mode": "raw",
            "raw": json.dumps(body_data, indent=2, ensure_ascii=False)
        }

    return item

def build_full_eshop_collection():
    collection = {
        "info": {
            "name": "HW06 - EShop Automated API Testing Collection",
            "description": "Bộ kiểm thử tự động API cho hệ thống EShop bao gồm FR-06, FR-09, FR-17 được tạo tự động bởi Agent Skill.",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "item": []
    }

    # 1. Folder Setup & Authentication
    auth_folder = {
        "name": "00_Setup_and_Authentication",
        "item": [
            create_postman_request_item(
                "01_Admin_Login_Get_Token", "POST", "/api/login",
                {"Content-Type": "application/json"},
                {"email": "{{admin_email}}", "password": "{{admin_password}}"}, 200,
                [
                    "const jsonData = pm.response.json();",
                    "if (jsonData.token) { pm.environment.set('admin_token', jsonData.token); console.log('[AUTH] Admin Token Saved'); }"
                ]
            ),
            create_postman_request_item(
                "02_User_Login_Get_Token", "POST", "/api/login",
                {"Content-Type": "application/json"},
                {"email": "{{user_email}}", "password": "{{user_password}}"}, 200,
                [
                    "const jsonData = pm.response.json();",
                    "if (jsonData.token) { pm.environment.set('user_token', jsonData.token); console.log('[AUTH] User Token Saved'); }"
                ]
            )
        ]
    }
    collection["item"].append(auth_folder)

    # 2. Folder FR-06: Xem chi tiết sản phẩm
    fr06_folder = {
        "name": "01_FR06_Product_Detail",
        "item": [
            create_postman_request_item(
                "TC_FR06_01_Get_Valid_Product_200", "GET", "/api/products/1", {}, None, 200,
                [
                    "const data = pm.response.json();",
                    "pm.expect(data).to.have.property('id');",
                    "pm.expect(data).to.have.property('name');",
                    "pm.expect(data).to.have.property('price');"
                ]
            ),
            create_postman_request_item(
                "TC_FR06_02_Get_Non_Existent_Product_404", "GET", "/api/products/999999", {}, None, 404
            ),
            create_postman_request_item(
                "TC_FR06_03_Boundary_Zero_ID_400", "GET", "/api/products/0", {}, None, 400
            ),
            create_postman_request_item(
                "TC_FR06_04_Boundary_Negative_ID_400", "GET", "/api/products/-5", {}, None, 400
            ),
            create_postman_request_item(
                "TC_FR06_05_Security_SQL_Injection_In_Path_400", "GET", "/api/products/1' OR '1'='1", {}, None, 400
            )
        ]
    }
    collection["item"].append(fr06_folder)

    # 3. Folder FR-09: Áp dụng mã giảm giá
    fr09_folder = {
        "name": "02_FR09_Apply_Coupon",
        "item": [
            create_postman_request_item(
                "TC_FR09_01_Apply_SAVE10_Valid_200", "POST", "/api/apply-coupon",
                {"Content-Type": "application/json", "Authorization": "Bearer {{user_token}}"},
                {"code": "SAVE10", "total_amount": 500000, "user_id": 1}, 200,
                [
                    "const res = pm.response.json();",
                    "pm.expect(res.discount_amount).to.equal(50000);",
                    "pm.expect(res.final_amount).to.equal(450000);"
                ]
            ),
            create_postman_request_item(
                "TC_FR09_02_Apply_BIGBUY_Fixed_Valid_200", "POST", "/api/apply-coupon",
                {"Content-Type": "application/json", "Authorization": "Bearer {{user_token}}"},
                {"code": "BIGBUY", "total_amount": 600000, "user_id": 1}, 200,
                [
                    "const res = pm.response.json();",
                    "pm.expect(res.discount_amount).to.equal(50000);",
                    "pm.expect(res.final_amount).to.equal(550000);"
                ]
            ),
            create_postman_request_item(
                "TC_FR09_03_Violation_C3_Below_Min_Order_400", "POST", "/api/apply-coupon",
                {"Content-Type": "application/json", "Authorization": "Bearer {{user_token}}"},
                {"code": "SAVE10", "total_amount": 200000, "user_id": 1}, 400
            ),
            create_postman_request_item(
                "TC_FR09_04_Violation_C2_Expired_Coupon_400", "POST", "/api/apply-coupon",
                {"Content-Type": "application/json", "Authorization": "Bearer {{user_token}}"},
                {"code": "EXPIRED", "total_amount": 300000, "user_id": 1}, 400
            ),
            create_postman_request_item(
                "TC_FR09_05_Violation_C4_No_Auth_Token_401", "POST", "/api/apply-coupon",
                {"Content-Type": "application/json"},
                {"code": "SAVE10", "total_amount": 500000, "user_id": 1}, 401
            ),
            create_postman_request_item(
                "TC_FR09_06_Security_IDOR_Tamper_UserId_403", "POST", "/api/apply-coupon",
                {"Content-Type": "application/json", "Authorization": "Bearer {{user_token}}"},
                {"code": "SAVE10", "total_amount": 500000, "user_id": 999}, 403
            )
        ]
    }
    collection["item"].append(fr09_folder)

    # 4. Folder FR-17: Quản lý mã giảm giá Admin CRUD
    fr17_folder = {
        "name": "03_FR17_Admin_Coupon_CRUD",
        "item": [
            create_postman_request_item(
                "TC_FR17_01_Create_New_Coupon_Admin_200", "POST", "/api/admin/coupons",
                {"Content-Type": "application/json", "Authorization": "Bearer {{admin_token}}"},
                {
                    "code": "AUTO2026",
                    "type": "percent",
                    "discount_value": 20,
                    "min_order_amount": 200000,
                    "expired_at": "2026-12-31",
                    "max_uses_per_user": 1
                }, 200
            ),
            create_postman_request_item(
                "TC_FR17_02_Security_User_Role_Forbidden_403", "POST", "/api/admin/coupons",
                {"Content-Type": "application/json", "Authorization": "Bearer {{user_token}}"},
                {
                    "code": "HACK2026",
                    "type": "percent",
                    "discount_value": 50,
                    "min_order_amount": 10000,
                    "expired_at": "2026-12-31",
                    "max_uses_per_user": 10
                }, 403
            ),
            create_postman_request_item(
                "TC_FR17_03_Get_All_Coupons_Admin_200", "GET", "/api/coupons",
                {"Authorization": "Bearer {{admin_token}}"}, None, 200
            ),
            create_postman_request_item(
                "TC_FR17_04_Delete_Non_Existent_Coupon_404", "DELETE", "/api/admin/coupons/999999",
                {"Authorization": "Bearer {{admin_token}}"}, None, 404
            )
        ]
    }
    collection["item"].append(fr17_folder)

    output_dir = "postman"
    os.makedirs(output_dir, exist_ok=True)
    output_path = os.path.join(output_dir, "eshop_api_collection.json")

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(collection, f, indent=2, ensure_ascii=False)

    print(f"[SUCCESS] Postman Collection Generated at: {output_path}")

if __name__ == "__main__":
    build_full_eshop_collection()
