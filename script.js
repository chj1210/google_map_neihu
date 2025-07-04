// 初始化地圖
var map = L.map('map').setView([25.083, 121.58], 14);

// 加入圖磚圖層 (Tile Layer)
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);