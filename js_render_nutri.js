/* renderNutri — NutriChihuahua */
function renderNutri() {
  const el = document.getElementById('tab-nutrichihuahua');
  if (!el) return;

  const ND  = {"total_benef": 23094, "total_apoyos": 24984, "RT": {"0-5": 3271, "6-11": 856, "12-17": 728, "18-29": 1990, "30-49": 4888, "50-64": 4758, "65+": 6524}, "RANGOS": ["0-5", "6-11", "12-17", "18-29", "30-49", "50-64", "65+"], "RLAB": {"0-5": "0–5", "6-11": "6–11", "12-17": "12–17", "18-29": "18–29", "30-49": "30–49", "50-64": "50–64", "65+": "65+"}, "muns": [{"n": "JUAREZ", "t": 3524, "m": 2754, "h": 770, "at": 3548, "am": 2765, "ah": 783, "rm": {"0-5": 97, "6-11": 55, "12-17": 35, "18-29": 159, "30-49": 989, "50-64": 951, "65+": 468}, "rh": {"0-5": 110, "6-11": 65, "12-17": 42, "18-29": 68, "30-49": 136, "50-64": 183, "65+": 166}}, {"n": "CHIHUAHUA", "t": 3187, "m": 2348, "h": 839, "at": 3194, "am": 2354, "ah": 840, "rm": {"0-5": 88, "6-11": 36, "12-17": 66, "18-29": 86, "30-49": 405, "50-64": 549, "65+": 1118}, "rh": {"0-5": 94, "6-11": 27, "12-17": 72, "18-29": 56, "30-49": 92, "50-64": 154, "65+": 344}}, {"n": "GUACHOCHI", "t": 1926, "m": 1439, "h": 487, "at": 1984, "am": 1481, "ah": 503, "rm": {"0-5": 136, "6-11": 21, "12-17": 41, "18-29": 176, "30-49": 431, "50-64": 325, "65+": 308}, "rh": {"0-5": 126, "6-11": 19, "12-17": 22, "18-29": 50, "30-49": 53, "50-64": 65, "65+": 152}}, {"n": "GUADALUPE Y CALVO", "t": 1636, "m": 1129, "h": 507, "at": 2096, "am": 1500, "ah": 596, "rm": {"0-5": 328, "6-11": 22, "12-17": 49, "18-29": 288, "30-49": 289, "50-64": 101, "65+": 61}, "rh": {"0-5": 272, "6-11": 17, "12-17": 21, "18-29": 55, "30-49": 67, "50-64": 32, "65+": 42}}, {"n": "HIDALGO DEL PARRAL", "t": 1471, "m": 1000, "h": 471, "at": 1475, "am": 1001, "ah": 474, "rm": {"0-5": 117, "6-11": 15, "12-17": 5, "18-29": 65, "30-49": 278, "50-64": 241, "65+": 280}, "rh": {"0-5": 115, "6-11": 19, "12-17": 16, "18-29": 27, "30-49": 43, "50-64": 94, "65+": 158}}, {"n": "BALLEZA", "t": 815, "m": 549, "h": 266, "at": 826, "am": 557, "ah": 269, "rm": {"0-5": 67, "6-11": 6, "12-17": 12, "18-29": 57, "30-49": 168, "50-64": 110, "65+": 128}, "rh": {"0-5": 60, "6-11": 8, "12-17": 3, "18-29": 10, "30-49": 45, "50-64": 56, "65+": 84}}, {"n": "BUENAVENTURA", "t": 620, "m": 432, "h": 188, "at": 637, "am": 441, "ah": 196, "rm": {"0-5": 7, "6-11": 59, "12-17": 4, "18-29": 20, "30-49": 86, "50-64": 89, "65+": 167}, "rh": {"0-5": 6, "6-11": 44, "12-17": 3, "18-29": 1, "30-49": 11, "50-64": 32, "65+": 91}}, {"n": "GUERRERO", "t": 612, "m": 422, "h": 190, "at": 614, "am": 424, "ah": 190, "rm": {"0-5": 0, "6-11": 2, "12-17": 1, "18-29": 22, "30-49": 113, "50-64": 118, "65+": 167}, "rh": {"0-5": 1, "6-11": 4, "12-17": 7, "18-29": 10, "30-49": 30, "50-64": 34, "65+": 104}}, {"n": "CARICHI", "t": 471, "m": 310, "h": 161, "at": 530, "am": 355, "ah": 175, "rm": {"0-5": 30, "6-11": 29, "12-17": 5, "18-29": 34, "30-49": 61, "50-64": 58, "65+": 83}, "rh": {"0-5": 37, "6-11": 26, "12-17": 1, "18-29": 10, "30-49": 14, "50-64": 14, "65+": 57}}, {"n": "CHINIPAS", "t": 469, "m": 313, "h": 156, "at": 484, "am": 327, "ah": 157, "rm": {"0-5": 78, "6-11": 7, "12-17": 17, "18-29": 29, "30-49": 61, "50-64": 46, "65+": 75}, "rh": {"0-5": 57, "6-11": 4, "12-17": 2, "18-29": 12, "30-49": 21, "50-64": 15, "65+": 45}}, {"n": "CUAUHTEMOC", "t": 469, "m": 302, "h": 167, "at": 473, "am": 305, "ah": 168, "rm": {"0-5": 32, "6-11": 5, "12-17": 4, "18-29": 37, "30-49": 94, "50-64": 72, "65+": 58}, "rh": {"0-5": 31, "6-11": 4, "12-17": 5, "18-29": 26, "30-49": 38, "50-64": 39, "65+": 24}}, {"n": "BOCOYNA", "t": 468, "m": 319, "h": 149, "at": 557, "am": 384, "ah": 173, "rm": {"0-5": 62, "6-11": 5, "12-17": 5, "18-29": 45, "30-49": 67, "50-64": 46, "65+": 66}, "rh": {"0-5": 52, "6-11": 3, "12-17": 5, "18-29": 16, "30-49": 26, "50-64": 19, "65+": 23}}, {"n": "GUAZAPARES", "t": 432, "m": 250, "h": 182, "at": 470, "am": 278, "ah": 192, "rm": {"0-5": 34, "6-11": 14, "12-17": 8, "18-29": 25, "30-49": 36, "50-64": 22, "65+": 96}, "rh": {"0-5": 40, "6-11": 11, "12-17": 3, "18-29": 15, "30-49": 20, "50-64": 19, "65+": 61}}, {"n": "BATOPILAS DE MANUEL GOMEZ MORIN", "t": 348, "m": 218, "h": 130, "at": 469, "am": 302, "ah": 167, "rm": {"0-5": 17, "6-11": 21, "12-17": 26, "18-29": 41, "30-49": 50, "50-64": 24, "65+": 28}, "rh": {"0-5": 21, "6-11": 23, "12-17": 10, "18-29": 19, "30-49": 20, "50-64": 9, "65+": 21}}, {"n": "MATAMOROS", "t": 333, "m": 194, "h": 139, "at": 358, "am": 213, "ah": 145, "rm": {"0-5": 42, "6-11": 6, "12-17": 2, "18-29": 21, "30-49": 20, "50-64": 25, "65+": 79}, "rh": {"0-5": 35, "6-11": 5, "12-17": 1, "18-29": 3, "30-49": 9, "50-64": 27, "65+": 59}}, {"n": "SAUCILLO", "t": 300, "m": 201, "h": 99, "at": 300, "am": 201, "ah": 99, "rm": {"0-5": 16, "6-11": 1, "12-17": 2, "18-29": 7, "30-49": 42, "50-64": 67, "65+": 66}, "rh": {"0-5": 14, "6-11": 1, "12-17": 3, "18-29": 2, "30-49": 9, "50-64": 32, "65+": 38}}, {"n": "NUEVO CASAS GRANDES", "t": 298, "m": 198, "h": 100, "at": 298, "am": 198, "ah": 100, "rm": {"0-5": 9, "6-11": 19, "12-17": 3, "18-29": 33, "30-49": 59, "50-64": 37, "65+": 38}, "rh": {"0-5": 6, "6-11": 28, "12-17": 8, "18-29": 6, "30-49": 17, "50-64": 17, "65+": 18}}, {"n": "URUACHI", "t": 294, "m": 179, "h": 115, "at": 371, "am": 234, "ah": 137, "rm": {"0-5": 32, "6-11": 8, "12-17": 6, "18-29": 30, "30-49": 39, "50-64": 25, "65+": 39}, "rh": {"0-5": 39, "6-11": 14, "12-17": 1, "18-29": 9, "30-49": 13, "50-64": 10, "65+": 29}}, {"n": "URIQUE", "t": 280, "m": 154, "h": 126, "at": 293, "am": 166, "ah": 127, "rm": {"0-5": 21, "6-11": 7, "12-17": 13, "18-29": 32, "30-49": 28, "50-64": 20, "65+": 32}, "rh": {"0-5": 28, "6-11": 2, "12-17": 28, "18-29": 22, "30-49": 18, "50-64": 13, "65+": 14}}, {"n": "CASAS GRANDES", "t": 251, "m": 153, "h": 98, "at": 254, "am": 154, "ah": 100, "rm": {"0-5": 8, "6-11": 8, "12-17": 30, "18-29": 6, "30-49": 26, "50-64": 38, "65+": 37}, "rh": {"0-5": 8, "6-11": 8, "12-17": 20, "18-29": 1, "30-49": 8, "50-64": 14, "65+": 39}}, {"n": "MADERA", "t": 241, "m": 128, "h": 113, "at": 241, "am": 128, "ah": 113, "rm": {"0-5": 22, "6-11": 3, "12-17": 8, "18-29": 17, "30-49": 18, "50-64": 16, "65+": 44}, "rh": {"0-5": 13, "6-11": 2, "12-17": 14, "18-29": 9, "30-49": 17, "50-64": 19, "65+": 39}}, {"n": "MORELOS", "t": 222, "m": 147, "h": 75, "at": 243, "am": 165, "ah": 78, "rm": {"0-5": 35, "6-11": 2, "12-17": 4, "18-29": 18, "30-49": 28, "50-64": 21, "65+": 38}, "rh": {"0-5": 31, "6-11": 3, "12-17": 1, "18-29": 4, "30-49": 7, "50-64": 7, "65+": 20}}, {"n": "SANTA ISABEL", "t": 216, "m": 145, "h": 71, "at": 216, "am": 145, "ah": 71, "rm": {"0-5": 15, "6-11": 2, "12-17": 1, "18-29": 8, "30-49": 26, "50-64": 32, "65+": 61}, "rh": {"0-5": 17, "6-11": 0, "12-17": 2, "18-29": 4, "30-49": 6, "50-64": 7, "65+": 35}}, {"n": "GOMEZ FARIAS", "t": 215, "m": 121, "h": 94, "at": 217, "am": 123, "ah": 94, "rm": {"0-5": 29, "6-11": 0, "12-17": 4, "18-29": 15, "30-49": 14, "50-64": 15, "65+": 44}, "rh": {"0-5": 42, "6-11": 1, "12-17": 1, "18-29": 3, "30-49": 4, "50-64": 19, "65+": 24}}, {"n": "SANTA BARBARA", "t": 213, "m": 133, "h": 80, "at": 213, "am": 133, "ah": 80, "rm": {"0-5": 25, "6-11": 1, "12-17": 6, "18-29": 6, "30-49": 25, "50-64": 22, "65+": 48}, "rh": {"0-5": 32, "6-11": 1, "12-17": 1, "18-29": 2, "30-49": 7, "50-64": 14, "65+": 23}}, {"n": "ALDAMA", "t": 198, "m": 102, "h": 96, "at": 198, "am": 102, "ah": 96, "rm": {"0-5": 10, "6-11": 4, "12-17": 2, "18-29": 23, "30-49": 30, "50-64": 19, "65+": 14}, "rh": {"0-5": 21, "6-11": 3, "12-17": 2, "18-29": 9, "30-49": 22, "50-64": 19, "65+": 20}}, {"n": "JIMENEZ", "t": 186, "m": 100, "h": 86, "at": 188, "am": 102, "ah": 86, "rm": {"0-5": 18, "6-11": 2, "12-17": 6, "18-29": 8, "30-49": 21, "50-64": 25, "65+": 21}, "rh": {"0-5": 17, "6-11": 5, "12-17": 2, "18-29": 12, "30-49": 17, "50-64": 23, "65+": 10}}, {"n": "TEMOSACHIC", "t": 174, "m": 101, "h": 73, "at": 174, "am": 101, "ah": 73, "rm": {"0-5": 31, "6-11": 5, "12-17": 0, "18-29": 3, "30-49": 17, "50-64": 18, "65+": 27}, "rh": {"0-5": 20, "6-11": 6, "12-17": 3, "18-29": 2, "30-49": 7, "50-64": 11, "65+": 24}}, {"n": "MORIS", "t": 172, "m": 122, "h": 50, "at": 172, "am": 122, "ah": 50, "rm": {"0-5": 18, "6-11": 1, "12-17": 0, "18-29": 11, "30-49": 26, "50-64": 22, "65+": 44}, "rh": {"0-5": 14, "6-11": 2, "12-17": 0, "18-29": 6, "30-49": 3, "50-64": 4, "65+": 21}}, {"n": "SAN FRANCISCO DE BORJA", "t": 160, "m": 104, "h": 56, "at": 161, "am": 105, "ah": 56, "rm": {"0-5": 18, "6-11": 0, "12-17": 2, "18-29": 9, "30-49": 13, "50-64": 13, "65+": 49}, "rh": {"0-5": 11, "6-11": 0, "12-17": 0, "18-29": 1, "30-49": 6, "50-64": 10, "65+": 28}}, {"n": "DELICIAS", "t": 157, "m": 112, "h": 45, "at": 157, "am": 112, "ah": 45, "rm": {"0-5": 13, "6-11": 1, "12-17": 2, "18-29": 4, "30-49": 41, "50-64": 30, "65+": 21}, "rh": {"0-5": 11, "6-11": 5, "12-17": 0, "18-29": 2, "30-49": 4, "50-64": 9, "65+": 14}}, {"n": "JANOS", "t": 155, "m": 81, "h": 74, "at": 155, "am": 81, "ah": 74, "rm": {"0-5": 16, "6-11": 2, "12-17": 1, "18-29": 1, "30-49": 10, "50-64": 15, "65+": 36}, "rh": {"0-5": 27, "6-11": 7, "12-17": 1, "18-29": 3, "30-49": 10, "50-64": 4, "65+": 22}}, {"n": "ROSARIO", "t": 151, "m": 95, "h": 56, "at": 152, "am": 95, "ah": 57, "rm": {"0-5": 16, "6-11": 1, "12-17": 0, "18-29": 9, "30-49": 15, "50-64": 17, "65+": 37}, "rh": {"0-5": 28, "6-11": 3, "12-17": 4, "18-29": 0, "30-49": 0, "50-64": 3, "65+": 18}}, {"n": "OCAMPO", "t": 127, "m": 77, "h": 50, "at": 128, "am": 77, "ah": 51, "rm": {"0-5": 0, "6-11": 1, "12-17": 1, "18-29": 2, "30-49": 9, "50-64": 19, "65+": 45}, "rh": {"0-5": 0, "6-11": 0, "12-17": 1, "18-29": 2, "30-49": 3, "50-64": 7, "65+": 37}}, {"n": "CAMARGO", "t": 126, "m": 99, "h": 27, "at": 126, "am": 99, "ah": 27, "rm": {"0-5": 0, "6-11": 9, "12-17": 3, "18-29": 3, "30-49": 41, "50-64": 25, "65+": 18}, "rh": {"0-5": 0, "6-11": 5, "12-17": 2, "18-29": 0, "30-49": 1, "50-64": 11, "65+": 8}}, {"n": "EL TULE", "t": 115, "m": 79, "h": 36, "at": 117, "am": 81, "ah": 36, "rm": {"0-5": 7, "6-11": 1, "12-17": 0, "18-29": 2, "30-49": 15, "50-64": 14, "65+": 40}, "rh": {"0-5": 5, "6-11": 1, "12-17": 0, "18-29": 0, "30-49": 2, "50-64": 9, "65+": 19}}, {"n": "CORONADO", "t": 114, "m": 89, "h": 25, "at": 115, "am": 89, "ah": 26, "rm": {"0-5": 6, "6-11": 1, "12-17": 0, "18-29": 10, "30-49": 25, "50-64": 15, "65+": 32}, "rh": {"0-5": 8, "6-11": 1, "12-17": 1, "18-29": 1, "30-49": 2, "50-64": 7, "65+": 5}}, {"n": "IGNACIO ZARAGOZA", "t": 110, "m": 49, "h": 61, "at": 110, "am": 49, "ah": 61, "rm": {"0-5": 7, "6-11": 6, "12-17": 1, "18-29": 3, "30-49": 11, "50-64": 7, "65+": 14}, "rh": {"0-5": 11, "6-11": 4, "12-17": 2, "18-29": 6, "30-49": 9, "50-64": 12, "65+": 17}}, {"n": "JULIMES", "t": 102, "m": 58, "h": 44, "at": 102, "am": 58, "ah": 44, "rm": {"0-5": 14, "6-11": 3, "12-17": 1, "18-29": 4, "30-49": 9, "50-64": 13, "65+": 14}, "rh": {"0-5": 16, "6-11": 1, "12-17": 1, "18-29": 1, "30-49": 6, "50-64": 5, "65+": 14}}, {"n": "NAMIQUIPA", "t": 100, "m": 47, "h": 53, "at": 100, "am": 47, "ah": 53, "rm": {"0-5": 0, "6-11": 1, "12-17": 3, "18-29": 3, "30-49": 12, "50-64": 11, "65+": 17}, "rh": {"0-5": 2, "6-11": 3, "12-17": 2, "18-29": 4, "30-49": 11, "50-64": 13, "65+": 18}}, {"n": "SATEVO", "t": 100, "m": 65, "h": 35, "at": 100, "am": 65, "ah": 35, "rm": {"0-5": 3, "6-11": 0, "12-17": 1, "18-29": 7, "30-49": 19, "50-64": 14, "65+": 21}, "rh": {"0-5": 8, "6-11": 0, "12-17": 0, "18-29": 1, "30-49": 6, "50-64": 8, "65+": 12}}, {"n": "MAGUARICHI", "t": 99, "m": 78, "h": 21, "at": 104, "am": 81, "ah": 23, "rm": {"0-5": 11, "6-11": 0, "12-17": 5, "18-29": 17, "30-49": 24, "50-64": 14, "65+": 7}, "rh": {"0-5": 9, "6-11": 1, "12-17": 0, "18-29": 1, "30-49": 5, "50-64": 3, "65+": 2}}, {"n": "AQUILES SERDAN", "t": 98, "m": 62, "h": 36, "at": 98, "am": 62, "ah": 36, "rm": {"0-5": 10, "6-11": 1, "12-17": 1, "18-29": 5, "30-49": 10, "50-64": 16, "65+": 19}, "rh": {"0-5": 5, "6-11": 1, "12-17": 2, "18-29": 0, "30-49": 5, "50-64": 9, "65+": 14}}, {"n": "AHUMADA", "t": 96, "m": 50, "h": 46, "at": 96, "am": 50, "ah": 46, "rm": {"0-5": 8, "6-11": 2, "12-17": 2, "18-29": 6, "30-49": 13, "50-64": 13, "65+": 6}, "rh": {"0-5": 9, "6-11": 4, "12-17": 2, "18-29": 6, "30-49": 9, "50-64": 7, "65+": 9}}, {"n": "NONOAVA", "t": 90, "m": 60, "h": 30, "at": 90, "am": 60, "ah": 30, "rm": {"0-5": 18, "6-11": 9, "12-17": 1, "18-29": 3, "30-49": 10, "50-64": 5, "65+": 14}, "rh": {"0-5": 12, "6-11": 4, "12-17": 0, "18-29": 1, "30-49": 3, "50-64": 7, "65+": 3}}, {"n": "ASCENSION", "t": 89, "m": 52, "h": 37, "at": 89, "am": 52, "ah": 37, "rm": {"0-5": 4, "6-11": 1, "12-17": 1, "18-29": 4, "30-49": 14, "50-64": 8, "65+": 20}, "rh": {"0-5": 1, "6-11": 4, "12-17": 2, "18-29": 1, "30-49": 8, "50-64": 8, "65+": 13}}, {"n": "MATACHI", "t": 89, "m": 47, "h": 42, "at": 89, "am": 47, "ah": 42, "rm": {"0-5": 19, "6-11": 4, "12-17": 0, "18-29": 3, "30-49": 9, "50-64": 3, "65+": 9}, "rh": {"0-5": 17, "6-11": 7, "12-17": 0, "18-29": 1, "30-49": 2, "50-64": 5, "65+": 10}}, {"n": "OJINAGA", "t": 85, "m": 48, "h": 37, "at": 86, "am": 49, "ah": 37, "rm": {"0-5": 8, "6-11": 3, "12-17": 3, "18-29": 2, "30-49": 11, "50-64": 10, "65+": 11}, "rh": {"0-5": 10, "6-11": 2, "12-17": 0, "18-29": 3, "30-49": 7, "50-64": 8, "65+": 7}}, {"n": "VALLE DE ZARAGOZA", "t": 74, "m": 50, "h": 24, "at": 74, "am": 50, "ah": 24, "rm": {"0-5": 1, "6-11": 0, "12-17": 0, "18-29": 6, "30-49": 16, "50-64": 14, "65+": 13}, "rh": {"0-5": 0, "6-11": 1, "12-17": 0, "18-29": 0, "30-49": 8, "50-64": 6, "65+": 9}}, {"n": "PRAXEDIS G. GUERRERO", "t": 70, "m": 44, "h": 26, "at": 70, "am": 44, "ah": 26, "rm": {"0-5": 4, "6-11": 0, "12-17": 1, "18-29": 6, "30-49": 1, "50-64": 11, "65+": 21}, "rh": {"0-5": 0, "6-11": 0, "12-17": 1, "18-29": 5, "30-49": 5, "50-64": 6, "65+": 9}}, {"n": "BACHINIVA", "t": 63, "m": 27, "h": 36, "at": 63, "am": 27, "ah": 36, "rm": {"0-5": 7, "6-11": 2, "12-17": 0, "18-29": 3, "30-49": 10, "50-64": 0, "65+": 5}, "rh": {"0-5": 9, "6-11": 1, "12-17": 2, "18-29": 1, "30-49": 2, "50-64": 7, "65+": 14}}, {"n": "MEOQUI", "t": 63, "m": 34, "h": 29, "at": 63, "am": 34, "ah": 29, "rm": {"0-5": 4, "6-11": 2, "12-17": 1, "18-29": 0, "30-49": 11, "50-64": 9, "65+": 7}, "rh": {"0-5": 3, "6-11": 1, "12-17": 1, "18-29": 3, "30-49": 3, "50-64": 9, "65+": 9}}, {"n": "CUSIHUIRIACHI", "t": 60, "m": 35, "h": 25, "at": 60, "am": 35, "ah": 25, "rm": {"0-5": 6, "6-11": 2, "12-17": 0, "18-29": 0, "30-49": 7, "50-64": 6, "65+": 14}, "rh": {"0-5": 6, "6-11": 0, "12-17": 0, "18-29": 1, "30-49": 2, "50-64": 8, "65+": 8}}, {"n": "GALEANA", "t": 59, "m": 43, "h": 16, "at": 59, "am": 43, "ah": 16, "rm": {"0-5": 9, "6-11": 2, "12-17": 2, "18-29": 8, "30-49": 6, "50-64": 9, "65+": 7}, "rh": {"0-5": 4, "6-11": 2, "12-17": 1, "18-29": 1, "30-49": 5, "50-64": 1, "65+": 2}}, {"n": "ALLENDE", "t": 55, "m": 36, "h": 19, "at": 55, "am": 36, "ah": 19, "rm": {"0-5": 6, "6-11": 4, "12-17": 0, "18-29": 2, "30-49": 8, "50-64": 11, "65+": 5}, "rh": {"0-5": 3, "6-11": 2, "12-17": 0, "18-29": 1, "30-49": 1, "50-64": 2, "65+": 10}}, {"n": "GUADALUPE", "t": 55, "m": 35, "h": 20, "at": 55, "am": 35, "ah": 20, "rm": {"0-5": 3, "6-11": 0, "12-17": 0, "18-29": 1, "30-49": 5, "50-64": 9, "65+": 17}, "rh": {"0-5": 1, "6-11": 2, "12-17": 0, "18-29": 5, "30-49": 1, "50-64": 7, "65+": 4}}, {"n": "HUEJOTITAN", "t": 53, "m": 41, "h": 12, "at": 53, "am": 41, "ah": 12, "rm": {"0-5": 1, "6-11": 1, "12-17": 0, "18-29": 1, "30-49": 3, "50-64": 8, "65+": 27}, "rh": {"0-5": 5, "6-11": 1, "12-17": 0, "18-29": 0, "30-49": 1, "50-64": 2, "65+": 3}}, {"n": "GRAN MORELOS", "t": 50, "m": 33, "h": 17, "at": 50, "am": 33, "ah": 17, "rm": {"0-5": 3, "6-11": 1, "12-17": 0, "18-29": 1, "30-49": 6, "50-64": 7, "65+": 15}, "rh": {"0-5": 5, "6-11": 1, "12-17": 0, "18-29": 0, "30-49": 1, "50-64": 0, "65+": 10}}, {"n": "LA CRUZ", "t": 47, "m": 29, "h": 18, "at": 47, "am": 29, "ah": 18, "rm": {"0-5": 0, "6-11": 0, "12-17": 2, "18-29": 5, "30-49": 5, "50-64": 9, "65+": 8}, "rh": {"0-5": 0, "6-11": 1, "12-17": 0, "18-29": 3, "30-49": 4, "50-64": 4, "65+": 6}}, {"n": "SAN FRANCISCO DE CONCHOS", "t": 45, "m": 25, "h": 20, "at": 45, "am": 25, "ah": 20, "rm": {"0-5": 2, "6-11": 0, "12-17": 0, "18-29": 3, "30-49": 3, "50-64": 5, "65+": 12}, "rh": {"0-5": 3, "6-11": 0, "12-17": 1, "18-29": 0, "30-49": 3, "50-64": 4, "65+": 9}}, {"n": "SAN FRANCISCO DEL ORO", "t": 43, "m": 23, "h": 20, "at": 43, "am": 23, "ah": 20, "rm": {"0-5": 4, "6-11": 1, "12-17": 0, "18-29": 0, "30-49": 2, "50-64": 9, "65+": 7}, "rh": {"0-5": 4, "6-11": 1, "12-17": 1, "18-29": 1, "30-49": 1, "50-64": 4, "65+": 8}}, {"n": "COYAME DEL SOTOL", "t": 42, "m": 24, "h": 18, "at": 47, "am": 29, "ah": 18, "rm": {"0-5": 7, "6-11": 1, "12-17": 0, "18-29": 1, "30-49": 5, "50-64": 6, "65+": 5}, "rh": {"0-5": 9, "6-11": 3, "12-17": 0, "18-29": 0, "30-49": 2, "50-64": 3, "65+": 1}}, {"n": "RIVA PALACIO", "t": 41, "m": 20, "h": 21, "at": 41, "am": 20, "ah": 21, "rm": {"0-5": 1, "6-11": 0, "12-17": 0, "18-29": 2, "30-49": 3, "50-64": 2, "65+": 12}, "rh": {"0-5": 1, "6-11": 0, "12-17": 1, "18-29": 0, "30-49": 1, "50-64": 5, "65+": 13}}, {"n": "ROSALES", "t": 33, "m": 29, "h": 4, "at": 33, "am": 29, "ah": 4, "rm": {"0-5": 0, "6-11": 0, "12-17": 2, "18-29": 8, "30-49": 11, "50-64": 5, "65+": 3}, "rh": {"0-5": 0, "6-11": 0, "12-17": 0, "18-29": 0, "30-49": 3, "50-64": 1, "65+": 0}}, {"n": "LOPEZ", "t": 26, "m": 15, "h": 11, "at": 26, "am": 15, "ah": 11, "rm": {"0-5": 5, "6-11": 3, "12-17": 0, "18-29": 0, "30-49": 2, "50-64": 2, "65+": 3}, "rh": {"0-5": 1, "6-11": 1, "12-17": 0, "18-29": 0, "30-49": 2, "50-64": 3, "65+": 4}}, {"n": "DR. BELISARIO DOMINGUEZ", "t": 11, "m": 8, "h": 3, "at": 11, "am": 8, "ah": 3, "rm": {"0-5": 1, "6-11": 0, "12-17": 0, "18-29": 0, "30-49": 2, "50-64": 2, "65+": 3}, "rh": {"0-5": 2, "6-11": 0, "12-17": 0, "18-29": 0, "30-49": 0, "50-64": 0, "65+": 1}}], "insts": [{"nombre": "DIF", "benef": 21811, "bm": 15179, "bh": 6708, "apoyos_total": 23637, "am": 16684, "ah": 6953, "programas": [{"n": "ALIMENTACION Y DESARROLLO AUTOSUSTENTABLE DE LAS FAMILIAS", "t": 21737, "m": 15138, "h": 6675}, {"n": "ASISTENCIA ALIMENTARIA EN ESPACIO COMUN", "t": 1853, "m": 1390, "h": 539}, {"n": "DESPENSA DE ALIMENTOS", "t": 19891, "m": 13754, "h": 6137}, {"n": "GESTION SOCIAL Y ATENCION A LA CIUDADANIA", "t": 75, "m": 42, "h": 33}, {"n": "DESPENSA DE ALIMENTOS", "t": 62, "m": 33, "h": 29}, {"n": "PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA", "t": 13, "m": 9, "h": 4}], "ap_programas": [{"n": "ALIMENTACION Y DESARROLLO AUTOSUSTENTABLE DE LAS FAMILIAS", "t": 23562, "apoyos": [{"n": "ASISTENCIA ALIMENTARIA EN ESPACIO COMUN", "t": 2834, "m": 2091, "h": 743}, {"n": "DESPENSA DE ALIMENTOS", "t": 20728, "m": 14551, "h": 6177}]}, {"n": "GESTION SOCIAL Y ATENCION A LA CIUDADANIA", "t": 75, "apoyos": [{"n": "DESPENSA DE ALIMENTOS", "t": 62, "m": 33, "h": 29}, {"n": "PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA", "t": 13, "m": 9, "h": 4}]}]}, {"nombre": "SDHyBC", "benef": 1076, "bm": 619, "bh": 457, "apoyos_total": 1078, "am": 621, "ah": 457, "programas": [{"n": "FORTALECIMIENTO COMUNITARIO Y PARTICIPACION CIUDADANA", "t": 1076, "m": 619, "h": 457}, {"n": "ASISTENCIA ALIMENTARIA EN ESPACIO COMUN", "t": 1076, "m": 619, "h": 457}], "ap_programas": [{"n": "FORTALECIMIENTO COMUNITARIO Y PARTICIPACION CIUDADANA", "t": 1078, "apoyos": [{"n": "ASISTENCIA ALIMENTARIA EN ESPACIO COMUN", "t": 1078, "m": 621, "h": 457}]}]}, {"nombre": "SPyCI", "benef": 244, "bm": 140, "bh": 104, "apoyos_total": 269, "am": 153, "ah": 116, "programas": [{"n": "ASISTENCIA SOCIAL PARA LA POBLACION INDIGENA", "t": 244, "m": 140, "h": 104}, {"n": "ASISTENCIA ALIMENTARIA EN ESPACIO COMUN", "t": 33, "m": 10, "h": 23}, {"n": "HOSPEDAJE Y ALIMENTACION", "t": 214, "m": 132, "h": 82}], "ap_programas": [{"n": "ASISTENCIA SOCIAL PARA LA POBLACION INDIGENA", "t": 269, "apoyos": [{"n": "ASISTENCIA ALIMENTARIA EN ESPACIO COMUN", "t": 34, "m": 10, "h": 24}, {"n": "HOSPEDAJE Y ALIMENTACION", "t": 235, "m": 143, "h": 92}]}]}], "apoyos": [{"n": "DESPENSA DE ALIMENTOS", "t": 20790, "m": 14584, "h": 6206, "insts": ["DIF"]}, {"n": "ASISTENCIA ALIMENTARIA EN ESPACIO COMUN", "t": 3946, "m": 2722, "h": 1224, "insts": ["DIF", "SDHyBC", "SPyCI"]}, {"n": "HOSPEDAJE Y ALIMENTACION", "t": 235, "m": 143, "h": 92, "insts": ["SPyCI"]}, {"n": "PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA", "t": 13, "m": 9, "h": 4, "insts": ["DIF"]}], "RT_M": {"0-5": 1666, "6-11": 431, "12-17": 401, "18-29": 1466, "30-49": 3964, "50-64": 3540, "65+": 4349}, "RT_H": {"0-5": 1605, "6-11": 425, "12-17": 327, "18-29": 524, "30-49": 924, "50-64": 1218, "65+": 2175}};
  const POB = {"AHUMADA": 16198, "ALDAMA": 27591, "ALLENDE": 8403, "AQUILES SERDAN": 33187, "ASCENSION": 27978, "BACHINIVA": 5850, "BALLEZA": 16406, "BATOPILAS DE MANUEL GOMEZ MORIN": 11069, "BOCOYNA": 23060, "BUENAVENTURA": 27426, "CAMARGO": 48426, "CARICHI": 7969, "CASAS GRANDES": 12513, "CHIHUAHUA": 1028306, "CHINIPAS": 5960, "CORONADO": 2060, "COYAME DEL SOTOL": 1218, "CUAUHTEMOC": 196633, "CUSIHUIRIACHI": 5826, "DELICIAS": 156678, "DR. BELISARIO DOMINGUEZ": 2475, "EL TULE": 1369, "GALEANA": 7291, "GOMEZ FARIAS": 6778, "GRAN MORELOS": 2484, "GUACHOCHI": 56871, "GUADALUPE": 3708, "GUADALUPE Y CALVO": 50243, "GUAZAPARES": 9305, "GUERRERO": 34977, "HIDALGO DEL PARRAL": 127636, "HUEJOTITAN": 787, "IGNACIO ZARAGOZA": 5040, "JANOS": 11321, "JIMENEZ": 39683, "JUAREZ": 1661295, "JULIMES": 5734, "LA CRUZ": 3686, "LOPEZ": 4291, "MADERA": 24000, "MAGUARICHI": 1277, "MANUEL BENAVIDES": 1103, "MATACHI": 2700, "MATAMOROS": 4351, "MEOQUI": 46611, "MORELOS": 7331, "MORIS": 4478, "NAMIQUIPA": 22649, "NONOAVA": 3036, "NUEVO CASAS GRANDES": 68506, "OCAMPO": 8965, "OJINAGA": 24243, "PRAXEDIS G. GUERRERO": 4842, "RIVA PALACIO": 7722, "ROSALES": 17031, "ROSARIO": 2196, "SAN FRANCISCO DE BORJA": 2315, "SAN FRANCISCO DE CONCHOS": 3030, "SAN FRANCISCO DEL ORO": 5027, "SANTA BARBARA": 12579, "SANTA ISABEL": 3814, "SATEVO": 3793, "SAUCILLO": 29693, "TEMOSACHIC": 5241, "URIQUE": 16988, "URUACHI": 7151, "VALLE DE ZARAGOZA": 4727};

  /* helpers */
  const fN = n => n>=1000 ? Number(n).toLocaleString('es-MX') : String(n);
  const pN = (a,b) => b ? (a/b*100).toFixed(1)+'%' : '—';
  const MIN = new Set(['de','del','y','a','en','con','para','por','la','las','el','los','al']);
  function toTit(s) {
    if (!s) return s;
    if (s !== s.toUpperCase()) return s;
    return s.split(' ').map((w,i)=>(i===0||!MIN.has(w.toLowerCase()))?w[0].toUpperCase()+w.slice(1).toLowerCase():w.toLowerCase()).join(' ');
  }
  function normN(s){ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase(); }

  const pobMap = {};
  Object.keys(POB).forEach(k => pobMap[normN(k)] = POB[k]);

  const totalB  = ND.total_benef;
  const totalA  = ND.total_apoyos;
  const RKEYS   = ND.RANGOS;
  const totBM   = ND.insts.reduce((s,i)=>s+i.bm,0);
  const totBH   = totalB - totBM;
  const munsSort= [...ND.muns].sort((a,b)=>b.t-a.t);
  const rangoMax= RKEYS.reduce((a,b)=>ND.RT[a]>=ND.RT[b]?a:b);
  const rangoMin= RKEYS.filter(r=>ND.RT[r]>0).reduce((a,b)=>ND.RT[a]<=ND.RT[b]?a:b);
  const munCobArr = ND.muns.map(m=>{const p=pobMap[normN(m.n)]||0;return{...m,pob:p,cob:p>0?m.t/p*100:0};}).filter(m=>m.pob>0);
  const munCobTop = [...munCobArr].sort((a,b)=>b.cob-a.cob)[0];
  const apTop = ND.apoyos[0];

  /* inst accent colors matching INST_COLORS */
  const NC = { DIF:'#DB2777', SDHyBC:'#1D9E75', SPyCI:'#C2410C' };

  /* ── KPI strip: fill the element that now exists in index.html ── */
  const kpiEl = document.getElementById('kpi-nutri');
  if (kpiEl) {
    kpiEl.innerHTML =
      kpiSS('Beneficiarios',    fN(totalB),              'localizables en el programa','cgr','gr') +
      kpiSS('Apoyos Entregados',fN(totalA),              (totalA/totalB).toFixed(2)+' por beneficiario','cg','g') +
      kpiSS('Mujeres',          (totBM/totalB*100).toFixed(1)+'%', fN(totBM)+' beneficiarias','cf','f') +
      kpiSS('Rango Mayor',      ND.RLAB[rangoMax],       fN(ND.RT[rangoMax])+' benef.','cr','r') +
      kpiSS('Municipio Líder',  toTit(munsSort[0]?.n||'—'), fN(munsSort[0]?.t||0)+' beneficiarios','cb','b') +
      kpiSS('Mayor Cobertura',  toTit(munCobTop?.n||'—'),   munCobTop?munCobTop.cob.toFixed(1)+'% de su pob.':'—','cgr','gr') +
      kpiSS('Apoyo Mayor',      toTit(apTop?.n||'—').split(' ').slice(0,3).join(' ')+'…', fN(apTop?.t||0)+' apoyos','cg','g') +
      kpiSS('Sin Cobertura',    '1', 'Manuel Benavides','cr','r');
  }

  /* ── slide nav + panels → into nutri-nav-panels ── */
  const navEl = document.getElementById('nutri-nav-panels');
  if (!navEl) return;
  navEl.innerHTML =
    '<div class="slide-nav-bar" style="margin-top:10px">' +
      '<button class="slide-nav-btn" onclick="nSw(+document.querySelector(".n-tab.active")?.dataset.i-1)">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<div class="slide-nav-tabs">' +
        '<button class="slide-nav-tab active n-tab" data-i="0" onclick="nSw(0)"><span class="snt-num">Sección I</span><span class="snt-title">Programas e<br>Instituciones</span><span class="snt-bar"></span></button>' +
        '<button class="slide-nav-tab n-tab" data-i="1" onclick="nSw(1)"><span class="snt-num">Sección II</span><span class="snt-title">Municipios</span><span class="snt-bar"></span></button>' +
        '<button class="slide-nav-tab n-tab" data-i="2" onclick="nSw(2)"><span class="snt-num">Sección III</span><span class="snt-title">Tipos de<br>Apoyo</span><span class="snt-bar"></span></button>' +
      '</div>' +
      '<button class="slide-nav-btn" onclick="nSw(+document.querySelector(".n-tab.active")?.dataset.i+1)">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>' +
      '</button>' +
    '</div>' +
    '<div id="n-p0" style="margin-top:16px"></div>' +
    '<div id="n-p1" style="margin-top:16px;display:none"></div>' +
    '<div id="n-p2" style="margin-top:16px;display:none"></div>';

  /* ════════════════════════════════════════
     SECCIÓN I — INSTITUCIONES
     Una card por institución:
     - Header con donut % + nombre + totales
     - Barra M/H
     - PROGRAMAS reales (de ap_programas) con beneficiarios
     - APOYOS reales (de ap_programas[].apoyos) con conteo
  ════════════════════════════════════════ */
  let p0 = '<style>' +
    '.nc-card{background:#161b22;border:1px solid rgba(205,217,229,.08);border-radius:14px;overflow:hidden;position:relative;transition:border-color .18s,transform .18s;animation:gv-fadein .35s ease both;}' +
    '.nc-card:hover{border-color:rgba(205,217,229,.2);transform:translateY(-2px);}' +
    '.nc-row{margin-bottom:9px;}' +
    '.nc-bar{height:5px;background:rgba(205,217,229,.07);border-radius:3px;overflow:hidden;}' +
    '.nc-bar-f{height:100%;border-radius:3px;}' +
    '.nc-sec-lbl{font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58;margin-bottom:8px;margin-top:14px;}' +
    '</style>' +
    '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin-bottom:20px">';

  ND.insts.forEach((inst, ii) => {
    const c   = NC[inst.nombre] || '#8b949e';
    const pM  = inst.benef>0 ? (inst.bm/inst.benef*100).toFixed(1) : 0;
    const pH  = (100-parseFloat(pM)).toFixed(1);
    const pct = totalB>0 ? (inst.benef/totalB*100) : 0;
    const ringR = 36, circ = 2*Math.PI*ringR;
    const dash = (Math.min(pct/100,1)*circ).toFixed(1);
    const delay = (ii*0.07).toFixed(2);

    /* Real programs from ap_programas */
    const realProgs = inst.ap_programas || [];
    /* Beneficiarios per real program — match by name from inst.programas */
    const benefByProg = {};
    (inst.programas||[]).forEach(p => { benefByProg[p.n] = (benefByProg[p.n]||0) + p.t; });

    p0 += '<div class="nc-card" style="animation-delay:'+delay+'s">';
    p0 += '<div style="height:4px;background:'+c+'"></div>';
    p0 += '<div style="padding:18px;display:flex;flex-direction:column;gap:0">';

    /* ── HEADER: donut + nombre + cifras ── */
    p0 += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">';
    /* donut */
    p0 += '<div style="position:relative;flex-shrink:0;width:80px;height:80px">';
    p0 += '<div style="position:absolute;inset:10px;border-radius:50%;background:#0d1117;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px">';
    p0 += '<div style="font-family:DM Mono,monospace;font-size:13px;font-weight:900;color:'+c+';line-height:1">'+pct.toFixed(1)+'%</div>';
    p0 += '<div style="font-size:9px;color:#484f58;line-height:1">del total</div>';
    p0 += '</div>';
    p0 += '<svg width="80" height="80" viewBox="0 0 80 80" style="position:absolute;inset:0">';
    p0 += '<circle cx="40" cy="40" r="'+ringR+'" fill="none" stroke="rgba(205,217,229,.07)" stroke-width="8"/>';
    p0 += '<circle cx="40" cy="40" r="'+ringR+'" fill="none" stroke="'+c+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+dash+' '+circ.toFixed(1)+'" transform="rotate(-90 40 40)"/>';
    p0 += '</svg>';
    p0 += '</div>';
    /* nombre y cifras */
    p0 += '<div style="flex:1;min-width:0">';
    p0 += '<div style="font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:'+c+';margin-bottom:6px">'+inst.nombre+'</div>';
    p0 += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">';
    p0 += '<div style="background:#0d1117;border-radius:8px;padding:8px 10px">';
    p0 += '<div style="font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Beneficiarios</div>';
    p0 += '<div style="font-family:DM Mono,monospace;font-size:20px;font-weight:800;color:#e6edf3;line-height:1">'+fN(inst.benef)+'</div>';
    p0 += '</div>';
    p0 += '<div style="background:#0d1117;border-radius:8px;padding:8px 10px">';
    p0 += '<div style="font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:3px">Apoyos</div>';
    p0 += '<div style="font-family:DM Mono,monospace;font-size:20px;font-weight:800;color:'+c+';line-height:1">'+fN(inst.apoyos_total)+'</div>';
    p0 += '</div>';
    p0 += '</div>';
    p0 += '</div>';
    p0 += '</div>'; /* /header */

    /* ── sexo bar ── */
    p0 += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">';
    p0 += '<span style="color:#f778ba;font-weight:600">M '+pM+'%&ensp;'+fN(inst.bm)+'</span>';
    p0 += '<span style="color:#79c0ff;font-weight:600">'+fN(inst.bh)+'&ensp;H '+pH+'%</span>';
    p0 += '</div>';
    p0 += '<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:16px">';
    p0 += '<div style="width:'+pM+'%;background:#f778ba;opacity:.85"></div>';
    p0 += '<div style="width:'+pH+'%;background:#79c0ff;opacity:.7"></div>';
    p0 += '</div>';

    /* ── PROGRAMAS (uno por entrada de ap_programas) ── */
    p0 += '<div style="height:1px;background:rgba(205,217,229,.06)"></div>';
    p0 += '<div class="nc-sec-lbl">Programas</div>';
    const maxProgB = Math.max(...realProgs.map(rp => benefByProg[rp.n]||rp.t), 1);
    realProgs.forEach(rp => {
      const benef = benefByProg[rp.n] || rp.t;
      const w = ((benef/maxProgB)*100).toFixed(1);
      /* beneficiarios del programa — buscar en inst.programas */
      const progBenef = (inst.programas||[]).find(p=>p.n===rp.n);
      const pMp = progBenef && progBenef.t>0 ? (progBenef.m/progBenef.t*100).toFixed(0) : 0;
      p0 += '<div class="nc-row">';
      p0 += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">';
      p0 += '<span style="font-size:12px;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72%" title="'+rp.n+'">'+toTit(rp.n)+'</span>';
      p0 += '<span style="font-family:DM Mono,monospace;font-size:13px;font-weight:700;color:#e6edf3">'+fN(benef)+'<span style="font-size:10px;font-weight:400;color:#484f58;margin-left:3px">benef.</span></span>';
      p0 += '</div>';
      p0 += '<div class="nc-bar"><div class="nc-bar-f" style="width:'+w+'%;background:'+c+';opacity:.65"></div></div>';
      p0 += '<div style="font-size:11px;color:#484f58;margin-top:2px">M '+pMp+'% · H '+(100-parseInt(pMp))+'%</div>';
      p0 += '</div>';
    });

    /* ── APOYOS (de ap_programas[].apoyos) ── */
    const allAps = [];
    realProgs.forEach(rp => (rp.apoyos||[]).forEach(a => {
      const existing = allAps.find(x=>x.n===a.n);
      if (existing) { existing.t+=a.t; existing.m+=a.m; existing.h+=a.h; }
      else allAps.push({...a});
    }));
    allAps.sort((a,b)=>b.t-a.t);
    const maxApoyoT = Math.max(...allAps.map(a=>a.t), 1);

    p0 += '<div style="height:1px;background:rgba(205,217,229,.06);margin-top:8px"></div>';
    p0 += '<div class="nc-sec-lbl">Apoyos Entregados</div>';
    allAps.forEach(a => {
      const w2 = ((a.t/inst.apoyos_total)*100).toFixed(1);
      const pMa = a.t>0 ? (a.m/a.t*100).toFixed(0) : 0;
      p0 += '<div class="nc-row">';
      p0 += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">';
      p0 += '<span style="font-size:12px;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:72%" title="'+a.n+'">'+toTit(a.n)+'</span>';
      p0 += '<span style="font-family:DM Mono,monospace;font-size:13px;font-weight:700;color:'+c+'">'+fN(a.t)+'<span style="font-size:10px;font-weight:400;color:#484f58;margin-left:3px">apoyos</span></span>';
      p0 += '</div>';
      p0 += '<div class="nc-bar"><div class="nc-bar-f" style="width:'+w2+'%;background:'+c+';opacity:.4"></div></div>';
      p0 += '<div style="font-size:11px;color:#484f58;margin-top:2px">M '+pMa+'% · H '+(100-parseInt(pMa))+'% · '+pN(a.t,inst.apoyos_total)+' del inst.</div>';
      p0 += '</div>';
    });

    p0 += '</div></div>'; /* /padding /card */
  });
  p0 += '</div>';

  /* rangos globales — pirámide de barras verticales */
  const maxRTV = Math.max(...RKEYS.map(r=>ND.RT[r]));
  const RCOL   = {'0-5':'#ffa657','6-11':'#56d364','12-17':'#79c0ff','18-29':'#f778ba',
                  '30-49':'#d2a8ff','50-64':'#39d353','65+':'#ff7b72'};

  p0 += '<div style="background:#161b22;border:1px solid rgba(205,217,229,.08);border-radius:14px;padding:20px 24px">';

  /* header */
  p0 += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:8px">';
  p0 += '<div style="display:flex;align-items:center;gap:10px">';
  p0 += '<span style="font-size:11px;font-weight:700;letter-spacing:.18em;text-transform:uppercase;color:#484f58">Distribución por Rango de Edad</span>';
  p0 += '<span style="font-family:DM Mono,monospace;font-size:12px;color:#388bfd;background:rgba(56,139,253,.1);padding:2px 9px;border-radius:20px;border:.5px solid rgba(56,139,253,.25)">'+fN(totalB)+' beneficiarios</span>';
  p0 += '</div>';
  p0 += '<div style="display:flex;align-items:center;gap:12px;font-size:11px">';
  p0 += '<span style="display:flex;align-items:center;gap:5px;color:#f778ba"><span style="display:inline-block;width:10px;height:3px;background:#f778ba;border-radius:2px"></span>Mujeres</span>';
  p0 += '<span style="display:flex;align-items:center;gap:5px;color:#79c0ff"><span style="display:inline-block;width:10px;height:3px;background:#79c0ff;border-radius:2px;opacity:.7"></span>Hombres</span>';
  p0 += '</div>';
  p0 += '</div>';

  /* barras verticales */
  p0 += '<div style="display:grid;grid-template-columns:repeat(7,1fr);gap:10px;align-items:end;padding:0 4px">';
  RKEYS.forEach(r => {
    const col  = RCOL[r] || '#8b949e';
    const tot  = ND.RT[r];
    const vm   = ND.RT_M[r] || 0;
    const vh   = ND.RT_H[r] || 0;
    const pctT = (tot/totalB*100).toFixed(1);
    const pctM = tot>0 ? (vm/tot*100).toFixed(0) : 0;
    const pctH = 100 - parseInt(pctM);
    const barH = Math.max(6, Math.round(tot/maxRTV*120));
    const barHM= Math.max(2, Math.round(vm/(tot||1)*barH));
    const barHH= Math.max(2, barH-barHM);
    const isDom= r === rangoMax;

    p0 += '<div style="display:flex;flex-direction:column;align-items:center;gap:5px;padding:8px 4px 10px;border-radius:10px;transition:background .15s;cursor:default" title="'+ND.RLAB[r]+' años: '+fN(tot)+' benef. ('+pctT+'%) · M '+pctM+'% / H '+pctH+'%">';
    /* número total arriba */
    p0 += '<div style="font-family:DM Mono,monospace;font-size:13px;font-weight:800;color:'+col+'">'+fN(tot)+'</div>';
    /* barras dobles verticales */
    p0 += '<div style="width:100%;display:flex;gap:3px;justify-content:center;align-items:flex-end;height:120px">';
    p0 += '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;min-width:0">';
    p0 += '<div style="background:#f778ba;opacity:.9;border-radius:4px 4px 0 0;width:100%;min-height:3px;height:'+barHM+'px"></div>';
    p0 += '</div>';
    p0 += '<div style="flex:1;display:flex;flex-direction:column;justify-content:flex-end;min-width:0">';
    p0 += '<div style="background:#79c0ff;opacity:.75;border-radius:4px 4px 0 0;width:100%;min-height:3px;height:'+barHH+'px"></div>';
    p0 += '</div>';
    p0 += '</div>';
    /* barra de color en la base */
    p0 += '<div style="width:80%;height:3px;background:'+col+';border-radius:2px;opacity:.6"></div>';
    /* etiqueta rango */
    p0 += '<div style="font-family:DM Mono,monospace;font-size:13px;font-weight:700;color:'+col+'">'+ND.RLAB[r]+'</div>';
    /* % del total */
    p0 += '<div style="font-size:11px;font-weight:600;color:#6e7f8d">'+pctT+'%</div>';
    /* M/H */
    p0 += '<div style="font-size:10px;text-align:center;line-height:1.5">';
    p0 += '<span style="color:#f778ba">M '+pctM+'%</span><br><span style="color:#79c0ff">H '+pctH+'%</span>';
    p0 += '</div>';
    p0 += '</div>';
  });
  p0 += '</div>';
  p0 += '</div>';

  document.getElementById('n-p0').innerHTML = p0;

  /* ════════════════════════════════════════
     SECCIÓN II — MUNICIPIOS
     Tabla dark idéntica a mun-panel-1
     Columnas: # · Municipio · Beneficiarios · Mujeres · Hombres · Cobertura · Apoyos · Rango Mayor · Rango Menor
  ════════════════════════════════════════ */
  const maxMunB  = munsSort[0]?.t || 1;
  const maxMunAp = Math.max(...ND.muns.map(m=>m.at||0)) || 1;
  const totApAll = ND.muns.reduce((s,m)=>s+(m.at||0),0);

  let mRows = '';
  munsSort.forEach((m, i) => {
    const pM2 = m.t>0 ? (m.m/m.t*100).toFixed(1) : 50;
    const pH2 = (100-parseFloat(pM2)).toFixed(1);
    const barB= Math.round((m.t/maxMunB)*100);
    const barA= Math.round(((m.at||0)/maxMunAp)*100);
    const pob = pobMap[normN(m.n)] || 0;
    const cob = pob>0
      ? '<span style="font-family:DM Mono,monospace;font-size:13px;font-weight:600;background:rgba(148,163,184,.08);color:#94a3b8;padding:3px 9px;border-radius:20px;border:.5px solid rgba(148,163,184,.2)">'+(m.t/pob*100).toFixed(1)+'%</span>'
      : '<span style="opacity:.3;color:#484f58">—</span>';
    const munRangos = RKEYS.map(r=>({r,tot:(m.rm[r]||0)+(m.rh[r]||0)})).filter(x=>x.tot>0);
    const rMax = munRangos.length ? munRangos.reduce((a,b)=>b.tot>a.tot?b:a).r : null;
    const rMin = munRangos.length>1 ? munRangos.reduce((a,b)=>b.tot<a.tot?b:a).r : null;
    const rMaxP = rMax ? '<span style="font-size:12px;font-weight:700;background:rgba(56,139,253,.15);color:#79c0ff;padding:2px 8px;border-radius:20px;border:.5px solid rgba(56,139,253,.25)">'+ND.RLAB[rMax]+'</span>' : '<span style="opacity:.3;color:#484f58">—</span>';
    const rMinP = rMin ? '<span style="font-size:12px;font-weight:700;background:rgba(255,166,87,.12);color:#ffa657;padding:2px 8px;border-radius:20px;border:.5px solid rgba(255,166,87,.25)">'+ND.RLAB[rMin]+'</span>' : '<span style="opacity:.3;color:#484f58">—</span>';
    const bg = i%2===0?'':'background:rgba(205,217,229,.02)';
    const TD = 'padding:9px 8px;border-bottom:1px solid rgba(205,217,229,.06)';
    mRows +=
      '<tr style="'+bg+'">' +
      '<td style="'+TD+';text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;color:#484f58;background:rgba(205,217,229,.06);padding:2px 7px;border-radius:20px;border:.5px solid rgba(205,217,229,.08)">'+(i+1)+'</span></td>' +
      '<td style="'+TD+';padding-left:14px"><span style="font-weight:600;font-size:14px;color:#e6edf3;font-family:DM Sans,system-ui,sans-serif">'+toTit(m.n)+'</span></td>' +
      '<td style="'+TD+'"><div style="display:flex;align-items:center;gap:7px"><div style="width:44px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+barB+'%;background:#388bfd;border-radius:2px"></div></div><span style="font-family:DM Mono,monospace;font-size:14px;color:#e6edf3">'+fN(m.t)+'</span></div></td>' +
      '<td style="'+TD+';text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;font-weight:600;color:#f778ba">'+fN(m.m)+'</span><div style="font-size:11px;color:#484f58">'+pM2+'%</div></td>' +
      '<td style="'+TD+';text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;font-weight:600;color:#79c0ff">'+fN(m.h)+'</span><div style="font-size:11px;color:#484f58">'+pH2+'%</div></td>' +
      '<td style="'+TD+';text-align:center">'+cob+'</td>' +
      '<td style="'+TD+'"><div style="display:flex;align-items:center;gap:7px"><div style="width:44px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+barA+'%;background:#e3b341;border-radius:2px"></div></div><span style="font-family:DM Mono,monospace;font-size:14px;color:#e3b341">'+fN(m.at||0)+'</span></div></td>' +
      '<td style="'+TD+';text-align:center">'+rMaxP+'</td>' +
      '<td style="'+TD+';text-align:center">'+rMinP+'</td>' +
      '</tr>';
  });
  /* total row */
  mRows +=
    '<tr style="background:#161b22;border-top:1px solid rgba(205,217,229,.2)">' +
    '<td style="padding:12px 8px;text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;color:#484f58">Σ</span></td>' +
    '<td style="padding:12px 14px;font-family:DM Sans,system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8b949e">Total · '+ND.muns.length+' municipios</td>' +
    '<td style="padding:12px 8px"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:700;color:#388bfd">'+fN(totalB)+'</span></td>' +
    '<td style="padding:12px 8px;text-align:center"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:700;color:#f778ba">'+fN(totBM)+'</span></td>' +
    '<td style="padding:12px 8px;text-align:center"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:700;color:#79c0ff">'+fN(totBH)+'</span></td>' +
    '<td></td>' +
    '<td style="padding:12px 8px"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:700;color:#e3b341">'+fN(totApAll)+'</span></td>' +
    '<td></td><td></td>' +
    '</tr>';

  const TH = 'padding:10px 8px;font-family:DM Sans,system-ui,sans-serif;font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8b949e';
  document.getElementById('n-p1').innerHTML =
    '<div style="background:#0d1117;border:1px solid rgba(205,217,229,.1);border-radius:12px;overflow:hidden">' +
    '<div style="padding:12px 20px;border-bottom:1px solid rgba(205,217,229,.08);display:flex;align-items:center;gap:10px;background:#161b22">' +
      '<span style="font-family:DM Sans,system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#8b949e">Municipios · NutriChihuahua</span>' +
      '<span style="font-family:DM Mono,monospace;font-size:13px;color:#388bfd;background:rgba(56,139,253,.1);padding:2px 9px;border-radius:20px;border:.5px solid rgba(56,139,253,.25)">'+ND.muns.length+' con cobertura</span>' +
      '<span style="font-family:DM Mono,monospace;font-size:13px;color:#ff7b72;background:rgba(255,123,114,.1);padding:2px 9px;border-radius:20px;border:.5px solid rgba(255,123,114,.2)">1 sin cobertura</span>' +
    '</div>' +
    '<table style="width:100%;border-collapse:collapse">' +
    '<thead><tr style="background:#161b22">' +
      '<th style="'+TH+';text-align:center;width:44px">#</th>' +
      '<th style="'+TH+';text-align:left;padding-left:14px">Municipio</th>' +
      '<th style="'+TH+';text-align:left">Beneficiarios</th>' +
      '<th style="'+TH+';text-align:center">Mujeres</th>' +
      '<th style="'+TH+';text-align:center">Hombres</th>' +
      '<th style="'+TH+';text-align:center">Cobertura</th>' +
      '<th style="'+TH+';text-align:left">Apoyos</th>' +
      '<th style="'+TH+';text-align:center">Rango Mayor</th>' +
      '<th style="'+TH+';text-align:center">Rango Menor</th>' +
    '</tr></thead>' +
    '<tbody>'+mRows+'</tbody>' +
    '</table></div>';

  /* ════════════════════════════════════════
     SECCIÓN III — TIPOS DE APOYO
     Contenedor cat-wrapper con cat-body grid
  ════════════════════════════════════════ */
  const maxApT = ND.apoyos[0]?.t || 1;
  let p2 = '';
  ND.apoyos.forEach((ap, ai) => {
    const c   = NC[ap.insts[0]] || '#8b949e';
    const pctM= ap.t>0 ? (ap.m/ap.t*100).toFixed(1) : 0;
    const pctH= (100-parseFloat(pctM)).toFixed(1);
    const barW= (ap.t/maxApT*100).toFixed(1);
    p2 += '<div class="cat-card" style="padding:0;gap:0;overflow:hidden;animation:gv-fadein .35s ease both;animation-delay:'+(ai*0.08).toFixed(2)+'s">';
    p2 += '<div style="height:4px;background:'+c+';border-radius:14px 14px 0 0;flex-shrink:0"></div>';
    p2 += '<div style="padding:16px;display:flex;flex-direction:column;gap:12px;flex:1">';
    /* icon + name row */
    p2 += '<div style="display:flex;align-items:flex-start;gap:12px">';
    p2 += '<div style="flex-shrink:0;width:52px;height:52px;border-radius:12px;background:'+c+'18;border:1px solid '+c+'33;display:flex;align-items:center;justify-content:center">';
    p2 += '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="'+c+'" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>';
    p2 += '</div>';
    p2 += '<div style="flex:1;min-width:0;min-height:52px;display:flex;flex-direction:column;justify-content:center;gap:5px">';
    p2 += '<div class="cat-apoyo-name" style="font-size:14px">'+toTit(ap.n)+'</div>';
    p2 += '<div style="display:flex;flex-wrap:wrap;gap:4px;align-items:center">';
    ap.insts.forEach((ins,idx) => {
      const ic = NC[ins]||'#8b949e';
      p2 += '<span style="font-size:10px;font-weight:700;color:'+ic+'">'+ins+'</span>';
      if (idx<ap.insts.length-1) p2+='<span style="color:#484f58;font-size:10px">·</span>';
    });
    p2 += '</div></div></div>';
    /* divider */
    p2 += '<div style="height:.5px;background:rgba(205,217,229,.08)"></div>';
    /* datos */
    p2 += '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:0">';
    p2 += '<div class="cat-dato"><div class="cat-dato-val" style="color:'+c+'">'+fN(ap.t)+'</div><div class="cat-dato-lbl">Apoyos</div></div>';
    p2 += '<div class="cat-dato"><div class="cat-dato-val" style="color:#f778ba">'+pctM+'%</div><div class="cat-dato-lbl">Mujeres</div></div>';
    p2 += '<div class="cat-dato"><div class="cat-dato-val" style="color:#79c0ff">'+pctH+'%</div><div class="cat-dato-lbl">Hombres</div></div>';
    p2 += '</div>';
    /* divider */
    p2 += '<div style="height:.5px;background:rgba(205,217,229,.08)"></div>';
    /* barra */
    p2 += '<div>';
    p2 += '<div style="display:flex;justify-content:space-between;font-size:11px;color:#484f58;margin-bottom:4px"><span>% del total de apoyos</span><strong style="color:#8b949e">'+pN(ap.t,totalA)+'</strong></div>';
    p2 += '<div style="height:6px;background:rgba(205,217,229,.07);border-radius:3px;overflow:hidden">';
    p2 += '<div style="height:100%;width:'+barW+'%;background:'+c+';border-radius:3px"></div></div>';
    p2 += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-top:6px">';
    p2 += '<span style="color:#f778ba;font-weight:600">M '+fN(ap.m)+'</span>';
    p2 += '<span style="color:#79c0ff;font-weight:600">'+fN(ap.h)+' H</span>';
    p2 += '</div></div>';
    p2 += '</div></div>';
  });

  document.getElementById('n-p2').innerHTML =
    '<div class="cat-wrapper">' +
      '<div class="cat-sticky-top">' +
        '<div class="cat-header">' +
          '<div class="cat-header-left">' +
            '<div class="cat-header-eyebrow">NutriChihuahua · 2026</div>' +
            '<div class="cat-header-title">Tipos de Apoyo Alimentario</div>' +
          '</div>' +
          '<div class="cat-header-stats">' +
            '<div class="cat-stat-pill"><div class="cat-stat-num">'+ND.apoyos.length+'</div><div class="cat-stat-lbl">Tipos</div></div>' +
            '<div class="cat-stat-pill"><div class="cat-stat-num">'+fN(totalA)+'</div><div class="cat-stat-lbl">Apoyos</div></div>' +
          '</div>' +
        '</div>' +
      '</div>' +
      '<div class="cat-body" style="grid-template-columns:repeat(auto-fill,minmax(280px,1fr))">'+p2+'</div>' +
    '</div>';

  /* panel switcher */
  window.nSw = function(idx) {
    const n = 3;
    idx = ((+idx%n)+n)%n;
    ['n-p0','n-p1','n-p2'].forEach((id,i)=>{
      document.getElementById(id).style.display = i===idx?'':'none';
    });
    document.querySelectorAll('#tab-nutrichihuahua .n-tab').forEach((t,i)=>{
      t.classList.toggle('active', i===idx);
    });
  };
}
