# 臺北市內湖區智慧綠色運輸轉型策略與模擬平台 - 技術架構設計

## 1. 系統架構圖

本系統採用分層式架構，確保模組化、可擴展性與關注點分離。主要分為前端、後端、數據處理層、數據庫以及外部服務。

```mermaid
graph TD
    subgraph "使用者端 (Client-Side)"
        A[使用者瀏覽器]
    end

    subgraph "前端 (Frontend)"
        B[React 應用程式]
        C[地圖與視覺化 (Deck.gl, Mapbox GL JS)]
        A --> B
        B --> C
    end

    subgraph "後端 (Backend - API Gateway)"
        D[Django REST Framework]
        B -- HTTPS/REST API --> D
    end

    subgraph "數據處理層 (Data Processing Layer)"
        E[數據整合服務 (Python/Pandas)]
        F[交通模擬引擎 (SUMO/Celery)]
        D -- 觸發 --> E
        D -- 啟動模擬任務 --> F
        E -- 清洗/轉換 --> G
        F -- 讀取路網/寫入結果 --> G
    end

    subgraph "數據庫 (Database)"
        G[PostgreSQL + PostGIS]
        D -- 讀寫 --> G
    end

    subgraph "外部服務 (External Services)"
        H[Google Maps Platform API]
        I[政府開放資料 (TDX)]
        J[感測器/物聯網數據]
        E -- 拉取數據 --> H
        E -- 拉取數據 --> I
        E -- 拉取數據 --> J
    end

    style B fill:#cde4ff,stroke:#333,stroke-width:2px
    style D fill:#ffcda1,stroke:#333,stroke-width:2px
    style E fill:#ffe4b5,stroke:#333,stroke-width:2px
    style F fill:#ffe4b5,stroke:#333,stroke-width:2px
    style G fill:#d1ffd1,stroke:#333,stroke-width:2px
    style H fill:#f9f9f9,stroke:#333,stroke-width:1px
    style I fill:#f9f9f9,stroke:#333,stroke-width:1px
    style J fill:#f9f9f9,stroke:#333,stroke-width:1px
```

## 2. 技術選型 (Tech Stack)

| 層級 | 技術 | 理由 |
| :--- | :--- | :--- |
| **前端** | **React.js** | 擁有龐大的社群與豐富的生態系，其元件化模式適合建構複雜且可維護的 UI。與主流地圖函式庫整合良好。 |
| **後端** | **Python (Django REST Framework)** | Python 在數據科學與地理空間分析領域擁有無可比擬的函式庫支援。Django 提供快速、安全的開發框架。 |
| **數據庫** | **PostgreSQL with PostGIS** | 處理地理空間資料的黃金標準，提供豐富的空間數據類型與分析函式，是路網分析與空間查詢的核心。 |
| **數據處理與模擬** | **Pandas, GeoPandas, SUMO** | Pandas/GeoPandas 用於高效的數據處理與空間分析。SUMO (Simulation of Urban MObility) 是一個開源、微觀、多模態的交通模擬套件，非常適合本專案的多情境模擬需求。 |
| **地圖與視覺化** | **Mapbox GL JS, Deck.gl** | Mapbox 提供高效能的向量地圖底圖，Deck.gl 則擅長大規模地理空間數據的 3D 視覺化，兩者結合能提供極致的地圖體驗。 |

## 3. 數據流 (Data Flow)

數據在本系統中的流動路徑如下：

1.  **數據收集 (Ingestion):**
    *   後端的「數據整合服務」會定期（例如每 5 分鐘）透過排程任務，從多個來源拉取數據：
        *   **Google Maps Platform API:** 獲取即時交通狀況、路徑規劃時間。
        *   **政府開放資料平台 (如 TDX API):** 獲取公車動態、路網基本資料、停車場資訊。
        *   **物聯網 (IoT) 數據:** 接收來自自動駕駛巴士、共享運具或路邊感測器的即時數據。

2.  **數據處理與儲存 (Processing & Storage):**
    *   收集到的原始數據（通常是 JSON 或 CSV 格式）會被進行清洗、轉換和標準化。
    *   使用 `GeoPandas` 將地址或路線轉換為地理空間格式。
    *   處理後的數據會被存入 `PostgreSQL/PostGIS` 數據庫中，例如存入 `road_network`、`traffic_flow_history` 等資料表。

3.  **模擬與分析 (Simulation & Analysis):**
    *   使用者在前端設定模擬情境（例如增加 50 輛自動駕駛小巴）。
    *   前端將情境參數透過 API 傳送至後端。
    *   後端啟動一個非同步的模擬任務，交由 `Celery` worker 執行。
    *   `SUMO` 模擬引擎會從 `PostGIS` 讀取最新的路網和交通數據，執行微觀交通模擬。
    *   模擬完成後，結果（如旅行時間、壅塞指數、碳排放）會被寫回數據庫的 `simulation_result` 資料表。

4.  **數據呈現 (Presentation):**
    *   前端應用程式向後端 API 請求特定情境的模擬結果或即時交通數據。
    *   後端從數據庫查詢對應資料，並以 RESTful API 的形式回傳給前端。
    *   前端使用 `Deck.gl` 將數據視覺化，例如以熱力圖呈現壅塞路段、以動畫軌跡展示車輛流動，並在儀表板上顯示關鍵績效指標 (KPI)。

## 4. 部署策略 (Deployment Strategy)

建議採用雲端平台進行部署，以獲得高可用性、彈性擴展與維運便利性。以 **AWS (Amazon Web Services)** 為例：

*   **前端應用 (React):**
    *   **部署方式:** 將靜態檔案（HTML, CSS, JS）部署至 **Amazon S3**，並搭配 **Amazon CloudFront** 作為 CDN，提供全球低延遲的內容分發。
    *   **理由:** 成本效益高、高可用性，且能加速全球使用者的載入速度。

*   **後端服務 (Django):**
    *   **部署方式:** 將後端應用程式容器化 (Docker)，並使用 **Amazon ECS (Elastic Container Service)** 或 **EKS (Elastic Kubernetes Service)** 進行容器編排與管理。
    *   **理由:** 實現自動擴展、滾動更新與服務健康檢查，確保 API 服務的穩定性。

*   **數據處理與模擬 (Celery/SUMO):**
    *   **部署方式:** 同樣容器化後，部署在獨立的 ECS/EKS 服務或專用的 **EC2 (Elastic Compute Cloud)** 執行個體上。可以設定 Auto Scaling Group，根據任務佇列的長度動態增減運算資源。
    *   **理由:** 將計算密集型任務與主 API 服務分離，避免影響 API 回應時間。可根據負載彈性調整成本與效能。

*   **數據庫 (PostgreSQL/PostGIS):**
    *   **部署方式:** 使用 **Amazon RDS (Relational Database Service)** for PostgreSQL，並啟用 PostGIS 擴充套件。
    *   **理由:** RDS 簡化了數據庫的管理工作，包含自動備份、災難恢復、安全性更新與效能監控。