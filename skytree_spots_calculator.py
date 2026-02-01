#!/usr/bin/env python3
"""
東京スカイツリー撮影スポット15か所の距離計算スクリプト
Haversine公式を使用して各スポットからスカイツリーまでの直線距離を計算
"""

import math

def haversine(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points
    on the earth (specified in decimal degrees)
    Returns distance in meters
    """
    # Convert decimal degrees to radians
    lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])

    # Haversine formula
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
    c = 2 * math.asin(math.sqrt(a))

    # Earth radius in meters
    r = 6371000

    return c * r

def main():
    # 東京スカイツリーの座標（基準点）
    skytree_lat = 35.7101
    skytree_lon = 139.8107

    # 15か所の撮影スポットの座標データ
    spots = [
        {
            "name": "十間橋（逆さスカイツリー）",
            "lat": 35.7103,
            "lon": 139.8177,
            "difficulty": "初級",
            "feature": "北十間川に映る逆さスカイツリーの定番スポット。川面の反射が美しい夕方〜夜間がおすすめ。超広角レンズ推奨。",
            "wikimedia_file": "Tokyo_Skytree_(14251293583).jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Tokyo_Skytree_%2814251293583%29.jpg/800px-Tokyo_Skytree_%2814251293583%29.jpg"
        },
        {
            "name": "西十間橋",
            "lat": 35.708791,
            "lon": 139.816069,
            "difficulty": "初級",
            "feature": "スカイツリーに最も近い逆さスカイツリースポット。押上駅から徒歩3分。ライトアップ時は大変混雑。",
            "wikimedia_file": "Tokyo_Chocolat_Tree.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/Tokyo_%22Chocolat%22_Tree_%2815456384404%29.jpg/800px-Tokyo_%22Chocolat%22_Tree_%2815456384404%29.jpg"
        },
        {
            "name": "源森橋（東武電車と）",
            "lat": 35.7106,
            "lon": 139.8065,
            "difficulty": "中級",
            "feature": "東武スカイツリーライン電車とスカイツリーを同時撮影できる人気スポット。東京ミズマチ近く。",
            "wikimedia_file": "Tokyo_Sky_Tree_&_Ryomo_(train).JPG",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/55/Tokyo_Sky_Tree_%26_Ryomo_%28train%29.JPG/800px-Tokyo_Sky_Tree_%26_Ryomo_%28train%29.JPG"
        },
        {
            "name": "桜橋（隅田川沿い）",
            "lat": 35.7178,
            "lon": 139.8003,
            "difficulty": "初級",
            "feature": "隅田川唯一のX字型歩行者専用橋。春は桜とスカイツリーの絶景。隅田公園に隣接。",
            "wikimedia_file": "Tokyo_Skytree_View_-_Bridge_(24111517126).jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Tokyo_Skytree_View_-_Bridge_%2824111517126%29.jpg/800px-Tokyo_Skytree_View_-_Bridge_%2824111517126%29.jpg"
        },
        {
            "name": "吾妻橋（アサヒビールと）",
            "lat": 35.7101,
            "lon": 139.8007,
            "difficulty": "初級",
            "feature": "金色のアサヒビール本社ビル・フラムドール（金の炎オブジェ）とスカイツリーの共演。浅草観光の定番。",
            "wikimedia_file": "Asahi_Breweries_headquarters_building_with_the_Asahi_Flame_and_Skytree.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/63/Asahi_Breweries_headquarters_building_with_the_Asahi_Flame_and_Skytree_at_blue_hour_with_full_moon%2C_Sumida-ku%2C_Tokyo%2C_Japan.jpg/800px-Asahi_Breweries_headquarters_building_with_the_Asahi_Flame_and_Skytree_at_blue_hour_with_full_moon%2C_Sumida-ku%2C_Tokyo%2C_Japan.jpg"
        },
        {
            "name": "浅草寺・雷門付近",
            "lat": 35.71114,
            "lon": 139.79637,
            "difficulty": "中級",
            "feature": "五重塔とスカイツリーを一緒に撮影可能。伝統と現代の融合。外国人観光客に大人気。",
            "wikimedia_file": "View_of_Tokyo_Skytree_from_Asakusa_20190420.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/43/View_of_Tokyo_Skytree_from_Asakusa_20190420_1.jpg/800px-View_of_Tokyo_Skytree_from_Asakusa_20190420_1.jpg"
        },
        {
            "name": "隅田公園",
            "lat": 35.71250,
            "lon": 139.80417,
            "difficulty": "初級",
            "feature": "春の桜、夏の花火大会とスカイツリー。広い公園内で様々なアングルが楽しめる。",
            "wikimedia_file": "Sumida_river_view_from_Tokyo_Skytree.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Sumida_river%2C_linking_Tait%C5%8D_and_Sumida_wards%2C_view_from_Tokyo_Skytree%2C_Japan.jpg/800px-Sumida_river%2C_linking_Tait%C5%8D_and_Sumida_wards%2C_view_from_Tokyo_Skytree%2C_Japan.jpg"
        },
        {
            "name": "言問橋",
            "lat": 35.7161,
            "lon": 139.8028,
            "difficulty": "初級",
            "feature": "隅田川と東武鉄道の鉄橋とスカイツリーを同時に撮影可能。夕暮れ時のシルエットが美しい。",
            "wikimedia_file": "Sumidagawa_Bridge_of_Tobu_Skytree_Line_and_Kototoibashi_Bridge.JPG",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d9/Sumidagawa_Bridge_of_Tobu_Skytree_Line_and_Kototoibashi_Bridge_on_Sumidagawa_River.JPG/800px-Sumidagawa_Bridge_of_Tobu_Skytree_Line_and_Kototoibashi_Bridge_on_Sumidagawa_River.JPG"
        },
        {
            "name": "駒形橋",
            "lat": 35.7055,
            "lon": 139.7968,
            "difficulty": "初級",
            "feature": "鋼製中路式アーチ橋の美しいデザインとスカイツリー。土木学会選奨土木遺産。",
            "wikimedia_file": "View_from_the_Komagata_Bridge.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9d/View_from_the_Komagata_Bridge.jpg/800px-View_from_the_Komagata_Bridge.jpg"
        },
        {
            "name": "東京駅・丸の内",
            "lat": 35.6812,
            "lon": 139.7671,
            "difficulty": "上級",
            "feature": "東京駅の赤レンガ駅舎とスカイツリーを超望遠レンズで同時撮影。約7km離れた遠景撮影。",
            "wikimedia_file": "Tokyo_Station_Marunouchi.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8e/Tokyo_Station_Marunouchi_side_on_November_23%2C_2018.jpg/800px-Tokyo_Station_Marunouchi_side_on_November_23%2C_2018.jpg"
        },
        {
            "name": "六本木ヒルズ",
            "lat": 35.660259,
            "lon": 139.729584,
            "difficulty": "中級",
            "feature": "海抜250mの東京シティビュー展望台から東京タワーと共に撮影可能。有料入場。",
            "wikimedia_file": "Aerial_Tokyo_at_night.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Drone_shot_with_Tokyo_Skytree_in_the_distance_at_night.jpg/800px-Drone_shot_with_Tokyo_Skytree_in_the_distance_at_night.jpg"
        },
        {
            "name": "東京タワー付近",
            "lat": 35.6586,
            "lon": 139.7454,
            "difficulty": "上級",
            "feature": "東京の新旧ランドマーク競演。超望遠レンズ必須。芝公園周辺から撮影。",
            "wikimedia_file": "Tokyo_Tower_20060211.JPG",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/9/93/Tokyo_Tower_20060211.JPG/800px-Tokyo_Tower_20060211.JPG"
        },
        {
            "name": "お台場・レインボーブリッジ",
            "lat": 35.635094,
            "lon": 139.767848,
            "difficulty": "上級",
            "feature": "レインボーブリッジとスカイツリーの同時撮影。東京湾越しの遠景。条件が良い日限定。",
            "wikimedia_file": "Rainbow_Bridge_Tokyo_Odaiba.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ce/Rainbow_Bridge%2C_Tokyo%2C_South_view_from_Odaiba_20190419_1.jpg/800px-Rainbow_Bridge%2C_Tokyo%2C_South_view_from_Odaiba_20190419_1.jpg"
        },
        {
            "name": "葛西臨海公園",
            "lat": 35.643051,
            "lon": 139.860395,
            "difficulty": "上級",
            "feature": "大観覧車とスカイツリー。東京湾岸からの遠景撮影。空気が澄んだ日がおすすめ。",
            "wikimedia_file": "View_of_Kasai_Rinkai_Park_with_Tokyo_SkyTree.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/70/View_of_Kasai_Rinkai_Park_with_Tokyo_SkyTree.jpg/800px-View_of_Kasai_Rinkai_Park_with_Tokyo_SkyTree.jpg"
        },
        {
            "name": "市川アイリンクタウン",
            "lat": 35.729119,
            "lon": 139.905991,
            "difficulty": "中級",
            "feature": "千葉県から東京を一望。45階展望施設は無料。日本夜景100選。富士山とスカイツリーを同時撮影可能。",
            "wikimedia_file": "Tokyo_Skytree_tower_from_i-link_town.jpg",
            "wikimedia_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Tokyo_Skytree_tower_from_i-link_town_%2827713082902%29.jpg/800px-Tokyo_Skytree_tower_from_i-link_town_%2827713082902%29.jpg"
        }
    ]

    # 距離を計算
    for spot in spots:
        spot["distance"] = haversine(skytree_lat, skytree_lon, spot["lat"], spot["lon"])

    # 距離でソート
    spots_sorted = sorted(spots, key=lambda x: x["distance"])

    # 結果を表示
    print("=" * 140)
    print("東京スカイツリー撮影スポット15か所 - 距離計算結果")
    print("=" * 140)
    print(f"基準点: 東京スカイツリー（緯度: {skytree_lat} N, 経度: {skytree_lon} E, 高さ: 634m）")
    print("距離計算方式: Haversine公式（地球半径 = 6,371km）")
    print("=" * 140)
    print()

    # テーブル形式で出力
    print(f"{'No.':<4} | {'スポット名':<28} | {'距離':<10} | {'難易度':<6} | {'緯度':<12} | {'経度':<12}")
    print("-" * 140)

    for i, spot in enumerate(spots_sorted, 1):
        distance_str = f"{spot['distance']:.0f}m" if spot['distance'] < 1000 else f"{spot['distance']/1000:.2f}km"
        print(f"{i:<4} | {spot['name']:<28} | {distance_str:<10} | {spot['difficulty']:<6} | {spot['lat']:<12.6f} | {spot['lon']:<12.6f}")

    print()
    print("=" * 140)
    print()

    # 詳細情報を表示
    print("【詳細情報】")
    print("=" * 140)

    for i, spot in enumerate(spots_sorted, 1):
        distance_str = f"{spot['distance']:.0f}m" if spot['distance'] < 1000 else f"{spot['distance']/1000:.2f}km"
        print(f"\n{i}. {spot['name']}")
        print(f"   座標: {spot['lat']}°N, {spot['lon']}°E")
        print(f"   距離: {distance_str}")
        print(f"   難易度: {spot['difficulty']}")
        print(f"   特徴: {spot['feature']}")
        print(f"   Wikimedia Commons画像: {spot['wikimedia_url']}")

    # マークダウン形式でも出力
    print()
    print("=" * 140)
    print("【マークダウン形式出力】")
    print("=" * 140)
    print()
    print("| No. | スポット名 | 距離 | 難易度 | 画像URL | 特徴 |")
    print("|-----|-----------|------|--------|---------|------|")

    for i, spot in enumerate(spots_sorted, 1):
        distance_str = f"{spot['distance']:.0f}m" if spot['distance'] < 1000 else f"{spot['distance']/1000:.2f}km"
        # 特徴を短くカット
        short_feature = spot['feature'][:50] + "..." if len(spot['feature']) > 50 else spot['feature']
        print(f"| {i} | {spot['name']} | {distance_str} | {spot['difficulty']} | [画像]({spot['wikimedia_url']}) | {short_feature} |")

if __name__ == "__main__":
    main()
