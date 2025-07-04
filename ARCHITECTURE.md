# 臺北市內湖區智慧綠色運輸轉型策略與模擬平台 - 技術架構設計

## 1. 專案概述

本文件旨在為「臺北市內湖區智慧綠色運輸轉型策略與模擬平台」專案提供全面的技術架構設計。此平台旨在整合 Google Earth API 的即時數據，用以模擬、分析及評估內湖區在引進自動駕駛巴士、共享運具、主動式運輸設施及智慧交通管理系統等綠色運輸轉型策略後的效果與影響。

---

## 2. 技術選型

為了滿足專案在地理空間資料處理、即時數據模擬與高效能視覺化方面的需求，我們建議採用以下技術棧：

### 2.1. 前端應用程式 (Frontend)

*   **框架：React.js**
    *   **理由：** React 擁有龐大且活躍的開發者社群與豐富的生態系。其元件化的開發模式有助於建立可維護、可擴展的複雜使用者介面。對於地圖應用，React 與主流地圖函式庫（如 Mapbox GL JS, Deck.gl）的整合非常成熟（例如 `react-map-gl`），能夠高效渲染大規模的地理空間數據與即時動畫效果。

*   **地圖視覺化：Deck.gl & Mapbox GL JS**
    *   **理由：** Deck.gl 是一個基於 WebGL 的大規模數據視覺化函式庫，特別擅長處理 3D 與地理空間數據，能夠流暢地渲染數百萬個數據點，非常適合展示交通流量、車輛軌跡等動態數據。Mapbox GL JS 則提供高效能的向量地圖底圖渲染。兩者可以無縫整合，提供極致的地圖視覺化體驗。

*   **狀態管理：Redux Toolkit**
    *   **理由：** 用於管理複雜的應用程式狀態，例如使用者設定、模擬參數、篩選條件等，確保數據流的單向與可預測性。

### 2.2. 後端服務 (Backend)

*   **主要框架：Python with Django & Django REST Framework**
    *   **理由：** Python 在數據科學、機器學習與地理空間分析領域擁有無可比擬的函式庫支援（例如 GeoPandas, Shapely, Scikit-learn）。Django 是一個成熟、功能完備的後端框架，其 "Batteries-included" 的哲學能加速開發進程。Django REST Framework 則能快速建立符合 RESTful 風格的 API。

*   **地理空間處理：GeoPandas & PostGIS**
    *   **理由：** GeoPandas 讓在 Python 中處理地理空間資料變得像使用 Pandas 一樣簡單。後端將利用它來進行路網分析、空間查詢等預處理。所有地理空間運算最終會由資料庫層的 PostGIS 高效執行。

*   **模擬引擎核心：Celery with Redis**
    *   **理由：** 交通模擬是計算密集型任務，不應阻塞主 API 服務。Celery 是一個強大的非同步任務佇列，可將模擬運算作為背景任務執行。Redis 則作為高效能的訊息代理 (Message Broker) 與結果後端。

### 2.3. 資料庫 (Database)

*   **主要資料庫：PostgreSQL with PostGIS Extension**
    *   **理由：** PostgreSQL 是一個穩定、可靠的開源物件關聯式資料庫。其 PostGIS 擴充套件是處理地理空間資料的黃金標準，提供了豐富的地理空間數據類型（如 `GEOMETRY`, `GEOGRAPHY`）和數百個空間分析函式，對於儲存路網、計算路徑、分析地理圍欄等核心功能至關重要。

---

## 3. 系統架構設計

本系統採用模組化的微服務導向架構，以確保各功能的高內聚、低耦合，並提升系統的擴展性與可維護性。

### 3.1. 高層架構圖

```mermaid
graph TD
    subgraph "使用者端 (Client-Side)"
        A[使用者瀏覽器] --> B{前端應用 (React + Deck.gl)};
    end

    subgraph "後端服務 (Server-Side)"
        B -- HTTP/S (REST API) --> C[API Gateway (Django)];
        C -- 非同步任務 --> D[模擬引擎 (Celery Workers)];
        C -- 數據請求 --> E[數據整合模組];
        C -- 數據存取 --> F[資料庫 (PostgreSQL/PostGIS)];
        D -- 讀取/寫入 --> F;
        E -- 數據拉取 --> G[外部數據源];
    end

    subgraph "外部服務 (External Services)"
        G[外部數據源] --> H[Google Earth/Maps Platform API];
        G --> I[政府開放資料平台];
    end

    D -- 使用 --> F;
    C -- 使用 --> F;

    style B fill:#cde4ff,stroke:#333,stroke-width:2px
    style C fill:#ffcda1,stroke:#333,stroke-width:2px
    style D fill:#ffcda1,stroke:#333,stroke-width:2px
    style E fill:#ffcda1,stroke:#333,stroke-width:2px
    style F fill:#d1ffd1,stroke:#333,stroke-width:2px
    style H fill:#f9f9f9,stroke:#333,stroke-width:1px
    style I fill:#f9f9f9,stroke:#333,stroke-width:1px
```

### 3.2. 核心功能模組

*   **使用者介面模組 (Frontend Application):**
    *   基於 React 開發的單頁應用程式 (SPA)。
    *   負責提供互動式地圖介面、模擬情境設定表單、數據視覺化儀表板及結果報告展示。

*   **地圖視覺化模組 (Map Visualization):**
    *   使用 Deck.gl 和 Mapbox GL JS。
    *   負責渲染基礎地理圖資、交通路網、即時車輛位置、交通流量熱力圖及模擬動畫。

*   **數據整合模組 (Data Integration):**
    *   後端的一個獨立服務或模組。
    *   定期從 Google Earth API、政府開放資料平台（如臺北市即時交通資訊）拉取數據，進行清洗、轉換後存入資料庫。

*   **模擬引擎模組 (Simulation Engine):**
    *   由 Celery Workers 組成。
    *   接收來自 API Gateway 的模擬任務，根據指定的情境參數（如自動駕駛巴士數量、路線、共享單車投放點），在背景執行交通流量模擬。

*   **政策評估模組 (Policy Evaluation):**
    *   後端的一個分析模組。
    *   在模擬結束後，此模組會分析模擬結果數據（如平均旅行時間、道路壅塞指數、碳排放量），並生成結構化的評估報告。

---

## 4. 資料模型設計 (初步綱要)

以下是核心資料實體的初步 Schema 設計，將使用 PostgreSQL/PostGIS 進行儲存。

```sql
-- 交通路網
CREATE TABLE road_network (
    edge_id SERIAL PRIMARY KEY,
    geometry GEOMETRY(LineString, 4326) NOT NULL, -- WGS84 座標系統
    road_name VARCHAR(255),
    road_type VARCHAR(50), -- 例如: 'motorway', 'primary', 'cycleway'
    max_speed_kmh INTEGER,
    number_of_lanes INTEGER
);

-- 交通流量歷史數據
CREATE TABLE traffic_flow_history (
    record_id SERIAL PRIMARY KEY,
    edge_id INTEGER REFERENCES road_network(edge_id),
    timestamp TIMESTAMPTZ NOT NULL,
    flow_count INTEGER, -- 單位時間通過車輛數
    average_speed_kmh FLOAT
);

-- 模擬情境參數
CREATE TABLE simulation_scenario (
    scenario_id SERIAL PRIMARY KEY,
    scenario_name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSONB, -- 儲存複雜參數, 例如: { "autonomous_buses": 50, "shared_bikes": 200 }
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 模擬結果
CREATE TABLE simulation_result (
    result_id SERIAL PRIMARY KEY,
    scenario_id INTEGER REFERENCES simulation_scenario(scenario_id),
    timestamp TIMESTAMPTZ NOT NULL,
    edge_id INTEGER REFERENCES road_network(edge_id),
    simulated_flow_count INTEGER,
    simulated_average_speed_kmh FLOAT,
    congestion_index FLOAT, -- 壅塞指數
    emissions_co2_g FLOAT -- 碳排放估算
);
```

---

## 5. API 整合策略

與 Google Earth API (或更廣泛的 Google Maps Platform) 的整合是本專案的關鍵。

*   **數據獲取：**
    1.  **即時交通數據：** 使用 Google Maps Platform 的 **Routes API** 或 **Directions API**。雖然它們不直接提供原始的交通圖層，但可以透過查詢特定路段的「含交通狀況的行駛時間」(`duration_in_traffic`) 來反推即-時路況，並將其對應到我們的路網上。
    2.  **地理編碼與地點資訊：** 使用 **Geocoding API** 和 **Places API** 將地址轉換為座標，或獲取特定地點的詳細資訊。
    3.  **衛星與街景影像：** 使用 **Map Tiles API** 的衛星圖塊 (`satellite`) 作為地圖底圖，並可整合 **Street View Static API** 提供特定地點的街景影像，以增加情境的真實感。

*   **整合方式：**
    *   **後端整合：** 「數據整合模組」將作為主要的整合點。它會設定排程任務（例如每 5 分鐘），透過後端伺服器向 Google API 發送請求。這樣做可以保護 API 金鑰，並集中管理 API 的使用配額。
    *   **數據轉換：** 從 Google API 獲取的數據（通常是 JSON 格式）會被解析、轉換，並與我們系統內部的 `road_network` 進行空間匹配，最後儲存到 `traffic_flow_history` 或直接用於即時模擬。

*   **前端展示：**
    *   前端應用程式會從我們的後端 API 獲取已經處理好的地理空間數據。
    *   使用 Deck.gl 的 `GeoJsonLayer` 或 `PathLayer` 來繪製路網，並根據即時速度或壅塞指數數據，動態更新道路的顏色或寬度，從而實現即時交通的視覺化。