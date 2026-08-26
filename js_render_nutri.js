/* renderNutri — NutriChihuahua */
function renderNutri() {
  const el = document.getElementById('tab-nutrichihuahua');
  if (!el) return;

  const ND  = {"total_benef":34678,"total_apoyos":34678,"RT":{"0-5":4412,"6-11":2565,"12-17":1647,"18-29":3240,"30-49":7376,"50-64":7331,"65+":8764},"RANGOS":["0-5","6-11","12-17","18-29","30-49","50-64","65+"],"RLAB":{"0-5":"0–5","6-11":"6–11","12-17":"12–17","18-29":"18–29","30-49":"30–49","50-64":"50–64","65+":"65+"},"muns":[{"n":"AHUMADA","t":102,"m":54,"h":48,"at":102,"am":54,"ah":48,"rm":{"0-5":8,"12-17":2,"18-29":7,"30-49":15,"50-64":17,"6-11":3,"65+":7},"rh":{"0-5":9,"12-17":3,"18-29":6,"30-49":10,"50-64":7,"6-11":4,"65+":10}},{"n":"ALDAMA","t":330,"m":167,"h":163,"at":330,"am":167,"ah":163,"rm":{"0-5":19,"12-17":5,"18-29":29,"30-49":49,"50-64":33,"6-11":9,"65+":26},"rh":{"0-5":27,"12-17":5,"18-29":17,"30-49":31,"50-64":35,"6-11":12,"65+":42}},{"n":"ALLENDE","t":62,"m":42,"h":20,"at":62,"am":42,"ah":20,"rm":{"0-5":7,"12-17":0,"18-29":2,"30-49":9,"50-64":14,"6-11":6,"65+":7},"rh":{"0-5":3,"12-17":0,"18-29":1,"30-49":1,"50-64":2,"6-11":4,"65+":12}},{"n":"AQUILES SERDAN","t":118,"m":76,"h":42,"at":118,"am":76,"ah":42,"rm":{"0-5":10,"12-17":1,"18-29":7,"30-49":16,"50-64":24,"6-11":2,"65+":21},"rh":{"0-5":6,"12-17":2,"18-29":0,"30-49":8,"50-64":9,"6-11":1,"65+":16}},{"n":"ASCENSION","t":166,"m":103,"h":63,"at":166,"am":103,"ah":63,"rm":{"0-5":5,"12-17":2,"18-29":6,"30-49":29,"50-64":26,"6-11":2,"65+":37},"rh":{"0-5":6,"12-17":2,"18-29":3,"30-49":15,"50-64":14,"6-11":5,"65+":20}},{"n":"BACHINIVA","t":227,"m":114,"h":113,"at":227,"am":114,"ah":113,"rm":{"0-5":17,"12-17":4,"18-29":19,"30-49":30,"50-64":19,"6-11":13,"65+":12},"rh":{"0-5":23,"12-17":2,"18-29":11,"30-49":22,"50-64":23,"6-11":10,"65+":22}},{"n":"BALLEZA","t":1041,"m":675,"h":366,"at":1041,"am":675,"ah":366,"rm":{"0-5":111,"12-17":22,"18-29":78,"30-49":209,"50-64":124,"6-11":19,"65+":139},"rh":{"0-5":92,"12-17":16,"18-29":16,"30-49":67,"50-64":73,"6-11":18,"65+":96}},{"n":"BATOPILAS DE MANUEL GOMEZ MORIN","t":398,"m":241,"h":157,"at":398,"am":241,"ah":157,"rm":{"0-5":19,"12-17":25,"18-29":49,"30-49":59,"50-64":27,"6-11":22,"65+":36},"rh":{"0-5":23,"12-17":13,"18-29":18,"30-49":34,"50-64":18,"6-11":27,"65+":25}},{"n":"BOCOYNA","t":610,"m":412,"h":198,"at":610,"am":412,"ah":198,"rm":{"0-5":64,"12-17":9,"18-29":51,"30-49":84,"50-64":57,"6-11":21,"65+":108},"rh":{"0-5":53,"12-17":14,"18-29":24,"30-49":31,"50-64":18,"6-11":11,"65+":47}},{"n":"BUENAVENTURA","t":826,"m":558,"h":268,"at":826,"am":558,"ah":268,"rm":{"0-5":45,"12-17":5,"18-29":34,"30-49":102,"50-64":123,"6-11":64,"65+":195},"rh":{"0-5":44,"12-17":3,"18-29":2,"30-49":14,"50-64":46,"6-11":52,"65+":117}},{"n":"CAMARGO","t":244,"m":167,"h":77,"at":244,"am":167,"ah":77,"rm":{"0-5":4,"12-17":15,"18-29":8,"30-49":54,"50-64":40,"6-11":25,"65+":26},"rh":{"0-5":5,"12-17":8,"18-29":5,"30-49":5,"50-64":23,"6-11":18,"65+":18}},{"n":"CARICHI","t":612,"m":394,"h":218,"at":612,"am":394,"ah":218,"rm":{"0-5":56,"12-17":7,"18-29":38,"30-49":79,"50-64":80,"6-11":30,"65+":105},"rh":{"0-5":58,"12-17":1,"18-29":10,"30-49":21,"50-64":22,"6-11":30,"65+":78}},{"n":"CASAS GRANDES","t":291,"m":178,"h":113,"at":291,"am":178,"ah":113,"rm":{"0-5":12,"12-17":37,"18-29":10,"30-49":33,"50-64":41,"6-11":10,"65+":42},"rh":{"0-5":12,"12-17":23,"18-29":2,"30-49":10,"50-64":14,"6-11":10,"65+":45}},{"n":"CHIHUAHUA","t":7071,"m":4551,"h":2520,"at":7071,"am":4551,"ah":2520,"rm":{"0-5":236,"12-17":379,"18-29":331,"30-49":888,"50-64":906,"6-11":493,"65+":1414},"rh":{"0-5":266,"12-17":401,"18-29":219,"30-49":343,"50-64":367,"6-11":477,"65+":513}},{"n":"CHINIPAS","t":542,"m":353,"h":189,"at":542,"am":353,"ah":189,"rm":{"0-5":91,"12-17":17,"18-29":34,"30-49":69,"50-64":53,"6-11":9,"65+":90},"rh":{"0-5":72,"12-17":2,"18-29":12,"30-49":24,"50-64":17,"6-11":8,"65+":61}},{"n":"CORONADO","t":115,"m":89,"h":26,"at":115,"am":89,"ah":26,"rm":{"0-5":6,"12-17":0,"18-29":10,"30-49":27,"50-64":15,"6-11":4,"65+":33},"rh":{"0-5":8,"12-17":1,"18-29":1,"30-49":2,"50-64":8,"6-11":1,"65+":6}},{"n":"COYAME DEL SOTOL","t":57,"m":32,"h":25,"at":57,"am":32,"ah":25,"rm":{"0-5":10,"12-17":1,"18-29":1,"30-49":6,"50-64":8,"6-11":2,"65+":8},"rh":{"0-5":13,"12-17":1,"18-29":0,"30-49":2,"50-64":5,"6-11":4,"65+":2}},{"n":"CUAUHTEMOC","t":699,"m":441,"h":258,"at":699,"am":441,"ah":258,"rm":{"0-5":43,"12-17":10,"18-29":63,"30-49":145,"50-64":103,"6-11":23,"65+":74},"rh":{"0-5":39,"12-17":15,"18-29":32,"30-49":67,"50-64":54,"6-11":25,"65+":43}},{"n":"CUSIHUIRIACHI","t":66,"m":39,"h":27,"at":66,"am":39,"ah":27,"rm":{"0-5":7,"12-17":0,"18-29":0,"30-49":9,"50-64":6,"6-11":4,"65+":15},"rh":{"0-5":6,"12-17":0,"18-29":1,"30-49":2,"50-64":9,"6-11":0,"65+":10}},{"n":"DELICIAS","t":287,"m":171,"h":116,"at":287,"am":171,"ah":116,"rm":{"0-5":15,"12-17":2,"18-29":12,"30-49":56,"50-64":54,"6-11":6,"65+":29},"rh":{"0-5":17,"12-17":2,"18-29":13,"30-49":35,"50-64":22,"6-11":14,"65+":23}},{"n":"DR. BELISARIO DOMINGUEZ","t":8,"m":5,"h":3,"at":8,"am":5,"ah":3,"rm":{"0-5":1,"12-17":0,"18-29":0,"30-49":0,"50-64":1,"6-11":0,"65+":3},"rh":{"0-5":2,"12-17":0,"18-29":0,"30-49":0,"50-64":0,"6-11":0,"65+":1}},{"n":"EL TULE","t":144,"m":97,"h":47,"at":144,"am":97,"ah":47,"rm":{"0-5":17,"12-17":1,"18-29":7,"30-49":15,"50-64":16,"6-11":3,"65+":43},"rh":{"0-5":16,"12-17":0,"18-29":0,"30-49":2,"50-64":9,"6-11":2,"65+":20}},{"n":"GALEANA","t":91,"m":68,"h":23,"at":91,"am":68,"ah":23,"rm":{"0-5":14,"12-17":2,"18-29":17,"30-49":10,"50-64":14,"6-11":3,"65+":11},"rh":{"0-5":10,"12-17":1,"18-29":1,"30-49":5,"50-64":1,"6-11":3,"65+":3}},{"n":"GOMEZ FARIAS","t":251,"m":149,"h":102,"at":251,"am":149,"ah":102,"rm":{"0-5":32,"12-17":4,"18-29":28,"30-49":18,"50-64":18,"6-11":2,"65+":53},"rh":{"0-5":46,"12-17":1,"18-29":3,"30-49":4,"50-64":24,"6-11":1,"65+":25}},{"n":"GRAN MORELOS","t":56,"m":36,"h":20,"at":56,"am":36,"ah":20,"rm":{"0-5":5,"12-17":0,"18-29":1,"30-49":7,"50-64":8,"6-11":3,"65+":15},"rh":{"0-5":8,"12-17":0,"18-29":0,"30-49":1,"50-64":0,"6-11":1,"65+":10}},{"n":"GUACHOCHI","t":2130,"m":1587,"h":543,"at":2130,"am":1587,"ah":543,"rm":{"0-5":152,"12-17":42,"18-29":233,"30-49":469,"50-64":361,"6-11":36,"65+":358},"rh":{"0-5":145,"12-17":19,"18-29":75,"30-49":55,"50-64":73,"6-11":38,"65+":162}},{"n":"GUADALUPE","t":65,"m":42,"h":23,"at":65,"am":42,"ah":23,"rm":{"0-5":4,"12-17":0,"18-29":2,"30-49":5,"50-64":13,"6-11":0,"65+":19},"rh":{"0-5":2,"12-17":0,"18-29":4,"30-49":0,"50-64":10,"6-11":2,"65+":5}},{"n":"GUADALUPE Y CALVO","t":1965,"m":1324,"h":641,"at":1965,"am":1324,"ah":641,"rm":{"0-5":314,"12-17":64,"18-29":317,"30-49":353,"50-64":128,"6-11":95,"65+":94},"rh":{"0-5":264,"12-17":34,"18-29":64,"30-49":87,"50-64":49,"6-11":103,"65+":62}},{"n":"GUAZAPARES","t":454,"m":267,"h":187,"at":454,"am":267,"ah":187,"rm":{"0-5":40,"12-17":7,"18-29":27,"30-49":35,"50-64":24,"6-11":20,"65+":115},"rh":{"0-5":49,"12-17":5,"18-29":8,"30-49":18,"50-64":21,"6-11":19,"65+":66}},{"n":"GUERRERO","t":703,"m":477,"h":226,"at":703,"am":477,"ah":226,"rm":{"0-5":2,"12-17":4,"18-29":29,"30-49":134,"50-64":136,"6-11":6,"65+":185},"rh":{"0-5":9,"12-17":9,"18-29":15,"30-49":35,"50-64":43,"6-11":11,"65+":114}},{"n":"HIDALGO DEL PARRAL","t":1781,"m":1208,"h":573,"at":1781,"am":1208,"ah":573,"rm":{"0-5":138,"12-17":11,"18-29":88,"30-49":340,"50-64":306,"6-11":34,"65+":342},"rh":{"0-5":139,"12-17":26,"18-29":35,"30-49":58,"50-64":116,"6-11":38,"65+":192}},{"n":"HUEJOTITAN","t":61,"m":45,"h":16,"at":61,"am":45,"ah":16,"rm":{"0-5":2,"12-17":0,"18-29":2,"30-49":4,"50-64":10,"6-11":1,"65+":28},"rh":{"0-5":7,"12-17":0,"18-29":1,"30-49":1,"50-64":2,"6-11":2,"65+":4}},{"n":"IGNACIO ZARAGOZA","t":112,"m":50,"h":62,"at":112,"am":50,"ah":62,"rm":{"0-5":7,"12-17":1,"18-29":3,"30-49":12,"50-64":7,"6-11":7,"65+":15},"rh":{"0-5":11,"12-17":2,"18-29":6,"30-49":10,"50-64":14,"6-11":4,"65+":20}},{"n":"JANOS","t":190,"m":102,"h":88,"at":190,"am":102,"ah":88,"rm":{"0-5":21,"12-17":1,"18-29":1,"30-49":13,"50-64":19,"6-11":2,"65+":45},"rh":{"0-5":32,"12-17":1,"18-29":3,"30-49":14,"50-64":4,"6-11":7,"65+":28}},{"n":"JIMENEZ","t":208,"m":119,"h":89,"at":208,"am":119,"ah":89,"rm":{"0-5":25,"12-17":6,"18-29":10,"30-49":29,"50-64":34,"6-11":4,"65+":26},"rh":{"0-5":17,"12-17":3,"18-29":13,"30-49":17,"50-64":26,"6-11":5,"65+":12}},{"n":"JUAREZ","t":6896,"m":5232,"h":1664,"at":6896,"am":5232,"ah":1664,"rm":{"0-5":164,"12-17":75,"18-29":388,"30-49":1694,"50-64":1818,"6-11":130,"65+":1073},"rh":{"0-5":167,"12-17":83,"18-29":140,"30-49":298,"50-64":475,"6-11":159,"65+":386}},{"n":"JULIMES","t":119,"m":66,"h":53,"at":119,"am":66,"ah":53,"rm":{"0-5":15,"12-17":1,"18-29":6,"30-49":12,"50-64":15,"6-11":4,"65+":16},"rh":{"0-5":17,"12-17":1,"18-29":3,"30-49":9,"50-64":7,"6-11":7,"65+":16}},{"n":"LA CRUZ","t":58,"m":37,"h":21,"at":58,"am":37,"ah":21,"rm":{"0-5":4,"12-17":2,"18-29":5,"30-49":7,"50-64":10,"6-11":1,"65+":9},"rh":{"0-5":1,"12-17":1,"18-29":3,"30-49":4,"50-64":4,"6-11":1,"65+":9}},{"n":"LOPEZ","t":54,"m":28,"h":26,"at":54,"am":28,"ah":26,"rm":{"0-5":15,"12-17":0,"18-29":2,"30-49":3,"50-64":3,"6-11":3,"65+":3},"rh":{"0-5":15,"12-17":0,"18-29":0,"30-49":2,"50-64":4,"6-11":1,"65+":4}},{"n":"MADERA","t":329,"m":191,"h":138,"at":329,"am":191,"ah":138,"rm":{"0-5":34,"12-17":8,"18-29":23,"30-49":27,"50-64":30,"6-11":20,"65+":61},"rh":{"0-5":19,"12-17":13,"18-29":13,"30-49":24,"50-64":23,"6-11":5,"65+":49}},{"n":"MAGUARICHI","t":144,"m":104,"h":40,"at":144,"am":104,"ah":40,"rm":{"0-5":9,"12-17":5,"18-29":22,"30-49":31,"50-64":20,"6-11":0,"65+":19},"rh":{"0-5":9,"12-17":0,"18-29":2,"30-49":7,"50-64":7,"6-11":2,"65+":13}},{"n":"MATACHI","t":105,"m":57,"h":48,"at":105,"am":57,"ah":48,"rm":{"0-5":23,"12-17":0,"18-29":6,"30-49":11,"50-64":3,"6-11":10,"65+":9},"rh":{"0-5":21,"12-17":0,"18-29":1,"30-49":2,"50-64":6,"6-11":12,"65+":11}},{"n":"MATAMOROS","t":351,"m":203,"h":148,"at":351,"am":203,"ah":148,"rm":{"0-5":44,"12-17":2,"18-29":23,"30-49":22,"50-64":30,"6-11":15,"65+":83},"rh":{"0-5":39,"12-17":1,"18-29":3,"30-49":9,"50-64":27,"6-11":18,"65+":64}},{"n":"MEOQUI","t":231,"m":111,"h":120,"at":231,"am":111,"ah":120,"rm":{"0-5":6,"12-17":6,"18-29":14,"30-49":28,"50-64":34,"6-11":7,"65+":19},"rh":{"0-5":5,"12-17":6,"18-29":18,"30-49":25,"50-64":34,"6-11":8,"65+":25}},{"n":"MORELOS","t":231,"m":153,"h":78,"at":231,"am":153,"ah":78,"rm":{"0-5":37,"12-17":4,"18-29":18,"30-49":31,"50-64":23,"6-11":2,"65+":40},"rh":{"0-5":32,"12-17":1,"18-29":3,"30-49":7,"50-64":9,"6-11":2,"65+":23}},{"n":"MORIS","t":176,"m":124,"h":52,"at":176,"am":124,"ah":52,"rm":{"0-5":19,"12-17":0,"18-29":12,"30-49":28,"50-64":24,"6-11":2,"65+":47},"rh":{"0-5":16,"12-17":0,"18-29":6,"30-49":4,"50-64":4,"6-11":3,"65+":21}},{"n":"NAMIQUIPA","t":272,"m":117,"h":155,"at":272,"am":117,"ah":155,"rm":{"0-5":8,"12-17":5,"18-29":26,"30-49":29,"50-64":20,"6-11":5,"65+":27},"rh":{"0-5":7,"12-17":17,"18-29":33,"30-49":24,"50-64":30,"6-11":12,"65+":39}},{"n":"NONOAVA","t":136,"m":84,"h":52,"at":136,"am":84,"ah":52,"rm":{"0-5":27,"12-17":2,"18-29":6,"30-49":16,"50-64":8,"6-11":13,"65+":17},"rh":{"0-5":19,"12-17":1,"18-29":1,"30-49":8,"50-64":12,"6-11":5,"65+":8}},{"n":"NUEVO CASAS GRANDES","t":331,"m":215,"h":116,"at":331,"am":215,"ah":116,"rm":{"0-5":15,"12-17":4,"18-29":36,"30-49":73,"50-64":38,"6-11":23,"65+":40},"rh":{"0-5":21,"12-17":10,"18-29":8,"30-49":17,"50-64":17,"6-11":31,"65+":19}},{"n":"OCAMPO","t":134,"m":84,"h":50,"at":134,"am":84,"ah":50,"rm":{"0-5":0,"12-17":1,"18-29":2,"30-49":13,"50-64":22,"6-11":1,"65+":46},"rh":{"0-5":0,"12-17":1,"18-29":2,"30-49":4,"50-64":8,"6-11":0,"65+":40}},{"n":"OJINAGA","t":193,"m":93,"h":100,"at":193,"am":93,"ah":100,"rm":{"0-5":16,"12-17":7,"18-29":9,"30-49":24,"50-64":20,"6-11":6,"65+":18},"rh":{"0-5":22,"12-17":3,"18-29":10,"30-49":16,"50-64":30,"6-11":9,"65+":15}},{"n":"PRAXEDIS G. GUERRERO","t":118,"m":73,"h":45,"at":118,"am":73,"ah":45,"rm":{"0-5":14,"12-17":2,"18-29":17,"30-49":8,"50-64":12,"6-11":0,"65+":21},"rh":{"0-5":13,"12-17":1,"18-29":5,"30-49":8,"50-64":9,"6-11":1,"65+":10}},{"n":"RIVA PALACIO","t":42,"m":21,"h":21,"at":42,"am":21,"ah":21,"rm":{"0-5":1,"12-17":0,"18-29":2,"30-49":4,"50-64":3,"6-11":0,"65+":13},"rh":{"0-5":1,"12-17":1,"18-29":0,"30-49":1,"50-64":6,"6-11":0,"65+":13}},{"n":"ROSALES","t":98,"m":69,"h":29,"at":98,"am":69,"ah":29,"rm":{"0-5":0,"12-17":2,"18-29":15,"30-49":27,"50-64":21,"6-11":0,"65+":4},"rh":{"0-5":0,"12-17":0,"18-29":5,"30-49":11,"50-64":9,"6-11":0,"65+":5}},{"n":"ROSARIO","t":182,"m":114,"h":68,"at":182,"am":114,"ah":68,"rm":{"0-5":20,"12-17":1,"18-29":10,"30-49":18,"50-64":19,"6-11":4,"65+":48},"rh":{"0-5":28,"12-17":5,"18-29":1,"30-49":2,"50-64":6,"6-11":11,"65+":23}},{"n":"SAN FRANCISCO DE BORJA","t":168,"m":111,"h":57,"at":168,"am":111,"ah":57,"rm":{"0-5":19,"12-17":2,"18-29":10,"30-49":13,"50-64":14,"6-11":0,"65+":54},"rh":{"0-5":12,"12-17":0,"18-29":1,"30-49":6,"50-64":11,"6-11":2,"65+":30}},{"n":"SAN FRANCISCO DE CONCHOS","t":39,"m":24,"h":15,"at":39,"am":24,"ah":15,"rm":{"0-5":2,"12-17":0,"18-29":3,"30-49":2,"50-64":5,"6-11":0,"65+":12},"rh":{"0-5":3,"12-17":0,"18-29":0,"30-49":2,"50-64":1,"6-11":0,"65+":9}},{"n":"SAN FRANCISCO DEL ORO","t":47,"m":26,"h":21,"at":47,"am":26,"ah":21,"rm":{"0-5":5,"12-17":0,"18-29":0,"30-49":4,"50-64":9,"6-11":1,"65+":8},"rh":{"0-5":4,"12-17":2,"18-29":1,"30-49":2,"50-64":4,"6-11":1,"65+":9}},{"n":"SANTA BARBARA","t":223,"m":137,"h":86,"at":223,"am":137,"ah":86,"rm":{"0-5":25,"12-17":6,"18-29":8,"30-49":27,"50-64":23,"6-11":4,"65+":50},"rh":{"0-5":37,"12-17":1,"18-29":2,"30-49":7,"50-64":14,"6-11":5,"65+":25}},{"n":"SANTA ISABEL","t":227,"m":150,"h":77,"at":227,"am":150,"ah":77,"rm":{"0-5":18,"12-17":1,"18-29":9,"30-49":28,"50-64":34,"6-11":6,"65+":63},"rh":{"0-5":20,"12-17":2,"18-29":4,"30-49":6,"50-64":7,"6-11":2,"65+":38}},{"n":"SATEVO","t":103,"m":68,"h":35,"at":103,"am":68,"ah":35,"rm":{"0-5":4,"12-17":2,"18-29":8,"30-49":19,"50-64":14,"6-11":0,"65+":23},"rh":{"0-5":8,"12-17":0,"18-29":1,"30-49":6,"50-64":8,"6-11":1,"65+":12}},{"n":"SAUCILLO","t":327,"m":221,"h":106,"at":327,"am":221,"ah":106,"rm":{"0-5":17,"12-17":3,"18-29":8,"30-49":45,"50-64":76,"6-11":3,"65+":81},"rh":{"0-5":14,"12-17":3,"18-29":3,"30-49":10,"50-64":35,"6-11":3,"65+":42}},{"n":"TEMOSACHIC","t":193,"m":114,"h":79,"at":193,"am":114,"ah":79,"rm":{"0-5":37,"12-17":0,"18-29":6,"30-49":21,"50-64":20,"6-11":7,"65+":30},"rh":{"0-5":24,"12-17":4,"18-29":2,"30-49":8,"50-64":10,"6-11":9,"65+":24}},{"n":"URIQUE","t":279,"m":160,"h":119,"at":279,"am":160,"ah":119,"rm":{"0-5":21,"12-17":16,"18-29":35,"30-49":29,"50-64":26,"6-11":7,"65+":31},"rh":{"0-5":28,"12-17":24,"18-29":20,"30-49":16,"50-64":18,"6-11":5,"65+":17}},{"n":"URUACHI","t":311,"m":190,"h":121,"at":311,"am":190,"ah":121,"rm":{"0-5":40,"12-17":7,"18-29":33,"30-49":37,"50-64":27,"6-11":8,"65+":41},"rh":{"0-5":50,"12-17":1,"18-29":6,"30-49":12,"50-64":10,"6-11":17,"65+":29}},{"n":"VALLE DE ZARAGOZA","t":78,"m":54,"h":24,"at":78,"am":54,"ah":24,"rm":{"0-5":3,"12-17":0,"18-29":6,"30-49":17,"50-64":16,"6-11":0,"65+":15},"rh":{"0-5":0,"12-17":0,"18-29":0,"30-49":8,"50-64":6,"6-11":1,"65+":9}}],"insts":[{"nombre":"DIF","benef":24639,"bm":17030,"bh":7653,"apoyos_total":0,"am":17030,"ah":7653,"programas":[{"n":"ALIMENTACION Y DESRROLLO AUTOSUSTENTABLE DE LAS FAMILIAS","t":19891,"m":13754,"h":6137},{"n":"ATENCION ALIMENTARIA A PERSONAS EN SITUACION DE VULNERABILIDAD","t":19243,"m":13021,"h":6222},{"n":"ATENCION ALIMENTARIA PRIMEROS 1000 DIAS DE VIDA","t":776,"m":767,"h":9},{"n":"CERENAM","t":1831,"m":1349,"h":491},{"n":"GESTION SOCIAL Y ATENCION A LA CIUDADANIA","t":30,"m":16,"h":14},{"n":"DESPENSA DE ALIMENTOS","t":17,"m":7,"h":10}],"ap_programas":[{"n":"ALIMENTACION Y DESRROLLO AUTOSUSTENTABLE DE LAS FAMILIAS","t":19891,"apoyos":[]},{"n":"ATENCION ALIMENTARIA A PERSONAS EN SITUACION DE VULNERABILIDAD","t":19243,"apoyos":[]},{"n":"ATENCION ALIMENTARIA PRIMEROS 1000 DIAS DE VIDA","t":776,"apoyos":[]},{"n":"CERENAM","t":1831,"apoyos":[]},{"n":"GESTION SOCIAL Y ATENCION A LA CIUDADANIA","t":30,"apoyos":[]},{"n":"DESPENSA DE ALIMENTOS","t":17,"apoyos":[]}]},{"nombre":"SDHyBC","benef":9863,"bm":6046,"bh":3817,"apoyos_total":0,"am":6046,"ah":3817,"programas":[{"n":"APOYO A PERSONAS MAYORES","t":10,"m":5,"h":5},{"n":"FORTALECIMIENTO COMUNITARIO Y PARTICIPACION CIUDADANA","t":8082,"m":4726,"h":3356},{"n":"JUAREZ CUENTA CONMIGO","t":2655,"m":1994,"h":661}],"ap_programas":[{"n":"APOYO A PERSONAS MAYORES","t":10,"apoyos":[]},{"n":"FORTALECIMIENTO COMUNITARIO Y PARTICIPACION CIUDADANA","t":8082,"apoyos":[]},{"n":"JUAREZ CUENTA CONMIGO","t":2655,"apoyos":[]}]},{"nombre":"SPyCI","benef":176,"bm":0,"bh":0,"apoyos_total":0,"am":0,"ah":0,"programas":[{"n":"ASISTENCIA SOCIAL PARA LA POBLACION INDIGENA","t":176,"m":0,"h":0}],"ap_programas":[{"n":"ASISTENCIA SOCIAL PARA LA POBLACION INDIGENA","t":176,"apoyos":[]}]}],"apoyos":[],"RT_M":{"0-5":2221,"6-11":1265,"12-17":850,"18-29":2322,"30-49":5760,"50-64":5302,"65+":5797},"RT_H":{"0-5":2191,"6-11":1300,"12-17":797,"18-29":918,"30-49":1616,"50-64":2029,"65+":2967}};
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
  const totBM   = Number.isFinite(ND.total_m) && ND.total_m > 0 ? ND.total_m : ND.insts.reduce((s,i)=>s+i.bm,0);
  const totBH   = Number.isFinite(ND.total_h) && ND.total_h > 0 ? ND.total_h : totalB - totBM;
  const munsSort= [...ND.muns].sort((a,b)=>b.t-a.t);
  const rangoMax= RKEYS.reduce((a,b)=>ND.RT[a]>=ND.RT[b]?a:b);
  const rangoMin= RKEYS.filter(r=>ND.RT[r]>0).reduce((a,b)=>ND.RT[a]<=ND.RT[b]?a:b);
  const munCobArr = ND.muns.map(m=>{const p=pobMap[normN(m.n)]||0;return{...m,pob:p,cob:p>0?m.t/p*100:0};}).filter(m=>m.pob>0);
  const munCobTop = [...munCobArr].sort((a,b)=>b.cob-a.cob)[0];
  const apTop = ND.apoyos[0];
  const apTopWords = toTit(apTop?.n||'—').split(' ');
  const apTopLabel = apTopWords.slice(0,3).join(' ') + (apTopWords.length > 3 ? '…' : '');

  /* inst accent colors matching INST_COLORS */
  const NC = { DIF:'#DB2777', SDHyBC:'#1D9E75', SPyCI:'#C2410C' };

  /* store data globally for modals */
  window._ncInsts  = ND.insts;
  window._ncMuns   = ND.muns;
  window._ncRKEYS  = ND.RANGOS;
  window._ncRLAB   = ND.RLAB;
  window._ncApoyos = ND.apoyos;
  window._ncMunAp  = {"BALLEZA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 42, "h": 18, "total": 60}, "DESPENSA DE ALIMENTOS": {"m": 513, "h": 247, "total": 760}, "HOSPEDAJE Y ALIMENTACION": {"m": 2, "h": 4, "total": 6}}, "BATOPILAS DE MANUEL GOMEZ MORIN": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 212, "h": 114, "total": 326}, "DESPENSA DE ALIMENTOS": {"m": 78, "h": 45, "total": 123}, "HOSPEDAJE Y ALIMENTACION": {"m": 12, "h": 8, "total": 20}}, "BOCOYNA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 241, "h": 104, "total": 345}, "DESPENSA DE ALIMENTOS": {"m": 128, "h": 52, "total": 180}, "HOSPEDAJE Y ALIMENTACION": {"m": 15, "h": 17, "total": 32}}, "CARICHI": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 102, "h": 38, "total": 140}, "DESPENSA DE ALIMENTOS": {"m": 243, "h": 135, "total": 378}, "HOSPEDAJE Y ALIMENTACION": {"m": 10, "h": 2, "total": 12}}, "CHINIPAS": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 18, "h": 5, "total": 23}, "DESPENSA DE ALIMENTOS": {"m": 309, "h": 151, "total": 460}, "HOSPEDAJE Y ALIMENTACION": {"m": 0, "h": 1, "total": 1}}, "FORANEO": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 2, "h": 0, "total": 2}, "DESPENSA DE ALIMENTOS": {"m": 38, "h": 39, "total": 77}, "HOSPEDAJE Y ALIMENTACION": {"m": 2, "h": 0, "total": 2}}, "GUACHOCHI": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 112, "h": 45, "total": 157}, "DESPENSA DE ALIMENTOS": {"m": 1332, "h": 437, "total": 1769}, "HOSPEDAJE Y ALIMENTACION": {"m": 36, "h": 21, "total": 57}, "PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA": {"m": 1, "h": 0, "total": 1}}, "GUADALUPE Y CALVO": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 1113, "h": 360, "total": 1473}, "DESPENSA DE ALIMENTOS": {"m": 363, "h": 225, "total": 588}, "HOSPEDAJE Y ALIMENTACION": {"m": 23, "h": 11, "total": 34}, "PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA": {"m": 1, "h": 0, "total": 1}}, "GUAZAPARES": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 105, "h": 53, "total": 158}, "DESPENSA DE ALIMENTOS": {"m": 166, "h": 134, "total": 300}, "HOSPEDAJE Y ALIMENTACION": {"m": 6, "h": 5, "total": 11}, "PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA": {"m": 1, "h": 0, "total": 1}}, "MAGUARICHI": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 47, "h": 14, "total": 61}, "DESPENSA DE ALIMENTOS": {"m": 33, "h": 9, "total": 42}, "HOSPEDAJE Y ALIMENTACION": {"m": 1, "h": 0, "total": 1}}, "MORELOS": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 44, "h": 13, "total": 57}, "DESPENSA DE ALIMENTOS": {"m": 119, "h": 62, "total": 181}, "HOSPEDAJE Y ALIMENTACION": {"m": 2, "h": 3, "total": 5}}, "URIQUE": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 57, "h": 57, "total": 114}, "DESPENSA DE ALIMENTOS": {"m": 98, "h": 63, "total": 161}, "HOSPEDAJE Y ALIMENTACION": {"m": 11, "h": 7, "total": 18}}, "URUACHI": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 111, "h": 49, "total": 160}, "DESPENSA DE ALIMENTOS": {"m": 114, "h": 83, "total": 197}, "HOSPEDAJE Y ALIMENTACION": {"m": 9, "h": 5, "total": 14}}, "ALDAMA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 11, "h": 21, "total": 32}, "DESPENSA DE ALIMENTOS": {"m": 91, "h": 75, "total": 166}}, "CAMARGO": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 10, "h": 5, "total": 15}, "DESPENSA DE ALIMENTOS": {"m": 89, "h": 22, "total": 111}}, "CASAS GRANDES": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 37, "h": 27, "total": 64}, "DESPENSA DE ALIMENTOS": {"m": 117, "h": 73, "total": 190}}, "CHIHUAHUA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 289, "h": 150, "total": 439}, "DESPENSA DE ALIMENTOS": {"m": 2056, "h": 684, "total": 2740}, "HOSPEDAJE Y ALIMENTACION": {"m": 3, "h": 2, "total": 5}, "PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA": {"m": 6, "h": 4, "total": 10}}, "CUAUHTEMOC": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 23, "h": 26, "total": 49}, "DESPENSA DE ALIMENTOS": {"m": 278, "h": 142, "total": 420}, "HOSPEDAJE Y ALIMENTACION": {"m": 4, "h": 0, "total": 4}}, "DELICIAS": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 9, "h": 6, "total": 15}, "DESPENSA DE ALIMENTOS": {"m": 103, "h": 39, "total": 142}}, "GUERRERO": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 14, "h": 10, "total": 24}, "DESPENSA DE ALIMENTOS": {"m": 408, "h": 180, "total": 588}, "HOSPEDAJE Y ALIMENTACION": {"m": 2, "h": 0, "total": 2}}, "HIDALGO DEL PARRAL": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 12, "h": 3, "total": 15}, "DESPENSA DE ALIMENTOS": {"m": 988, "h": 468, "total": 1456}, "HOSPEDAJE Y ALIMENTACION": {"m": 1, "h": 3, "total": 4}}, "JUAREZ": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 19, "h": 12, "total": 31}, "DESPENSA DE ALIMENTOS": {"m": 2745, "h": 771, "total": 3516}, "HOSPEDAJE Y ALIMENTACION": {"m": 1, "h": 0, "total": 1}}, "MADERA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 6, "h": 9, "total": 15}, "DESPENSA DE ALIMENTOS": {"m": 122, "h": 104, "total": 226}}, "MATAMOROS": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 52, "h": 44, "total": 96}, "DESPENSA DE ALIMENTOS": {"m": 161, "h": 101, "total": 262}}, "MEOQUI": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 10, "h": 5, "total": 15}, "DESPENSA DE ALIMENTOS": {"m": 24, "h": 24, "total": 48}}, "NAMIQUIPA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 14, "h": 23, "total": 37}, "DESPENSA DE ALIMENTOS": {"m": 33, "h": 30, "total": 63}}, "NONOAVA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 7, "h": 5, "total": 12}, "DESPENSA DE ALIMENTOS": {"m": 53, "h": 25, "total": 78}}, "OJINAGA": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 2, "h": 8, "total": 10}, "DESPENSA DE ALIMENTOS": {"m": 47, "h": 29, "total": 76}}, "EL TULE": {"ASISTENCIA ALIMENTARIA EN ESPACIO COMUN": {"m": 1, "h": 0, "total": 1}, "DESPENSA DE ALIMENTOS": {"m": 79, "h": 36, "total": 115}, "HOSPEDAJE Y ALIMENTACION": {"m": 1, "h": 0, "total": 1}}, "AHUMADA": {"DESPENSA DE ALIMENTOS": {"m": 50, "h": 46, "total": 96}}, "ALLENDE": {"DESPENSA DE ALIMENTOS": {"m": 36, "h": 19, "total": 55}}, "AQUILES SERDAN": {"DESPENSA DE ALIMENTOS": {"m": 62, "h": 36, "total": 98}}, "ASCENSION": {"DESPENSA DE ALIMENTOS": {"m": 52, "h": 37, "total": 89}}, "BACHINIVA": {"DESPENSA DE ALIMENTOS": {"m": 27, "h": 36, "total": 63}}, "BUENAVENTURA": {"DESPENSA DE ALIMENTOS": {"m": 441, "h": 196, "total": 637}}, "CORONADO": {"DESPENSA DE ALIMENTOS": {"m": 89, "h": 26, "total": 115}}, "COYAME DEL SOTOL": {"DESPENSA DE ALIMENTOS": {"m": 29, "h": 18, "total": 47}}, "CUSIHUIRIACHI": {"DESPENSA DE ALIMENTOS": {"m": 35, "h": 25, "total": 60}}, "DR. BELISARIO DOMINGUEZ": {"DESPENSA DE ALIMENTOS": {"m": 8, "h": 3, "total": 11}}, "GALEANA": {"DESPENSA DE ALIMENTOS": {"m": 43, "h": 16, "total": 59}}, "GOMEZ FARIAS": {"DESPENSA DE ALIMENTOS": {"m": 123, "h": 94, "total": 217}}, "GRAN MORELOS": {"DESPENSA DE ALIMENTOS": {"m": 33, "h": 17, "total": 50}}, "GUADALUPE": {"DESPENSA DE ALIMENTOS": {"m": 35, "h": 20, "total": 55}}, "HUEJOTITAN": {"DESPENSA DE ALIMENTOS": {"m": 41, "h": 12, "total": 53}}, "IGNACIO ZARAGOZA": {"DESPENSA DE ALIMENTOS": {"m": 49, "h": 61, "total": 110}}, "JANOS": {"DESPENSA DE ALIMENTOS": {"m": 81, "h": 74, "total": 155}}, "JIMENEZ": {"DESPENSA DE ALIMENTOS": {"m": 101, "h": 85, "total": 186}, "HOSPEDAJE Y ALIMENTACION": {"m": 1, "h": 1, "total": 2}}, "JULIMES": {"DESPENSA DE ALIMENTOS": {"m": 58, "h": 44, "total": 102}}, "LA CRUZ": {"DESPENSA DE ALIMENTOS": {"m": 29, "h": 18, "total": 47}}, "LOPEZ": {"DESPENSA DE ALIMENTOS": {"m": 15, "h": 11, "total": 26}}, "MATACHI": {"DESPENSA DE ALIMENTOS": {"m": 47, "h": 42, "total": 89}}, "MORIS": {"DESPENSA DE ALIMENTOS": {"m": 122, "h": 50, "total": 172}}, "NO IDENTIFICADO": {"DESPENSA DE ALIMENTOS": {"m": 740, "h": 0, "total": 740}}, "NUEVO CASAS GRANDES": {"DESPENSA DE ALIMENTOS": {"m": 198, "h": 100, "total": 298}}, "OCAMPO": {"DESPENSA DE ALIMENTOS": {"m": 77, "h": 50, "total": 127}, "HOSPEDAJE Y ALIMENTACION": {"m": 0, "h": 1, "total": 1}}, "PRAXEDIS G. GUERRERO": {"DESPENSA DE ALIMENTOS": {"m": 44, "h": 26, "total": 70}}, "RIVA PALACIO": {"DESPENSA DE ALIMENTOS": {"m": 20, "h": 21, "total": 41}}, "ROSALES": {"DESPENSA DE ALIMENTOS": {"m": 29, "h": 4, "total": 33}}, "ROSARIO": {"DESPENSA DE ALIMENTOS": {"m": 95, "h": 57, "total": 152}}, "SAN FRANCISCO DE BORJA": {"DESPENSA DE ALIMENTOS": {"m": 105, "h": 56, "total": 161}}, "SAN FRANCISCO DE CONCHOS": {"DESPENSA DE ALIMENTOS": {"m": 25, "h": 20, "total": 45}}, "SAN FRANCISCO DEL ORO": {"DESPENSA DE ALIMENTOS": {"m": 23, "h": 20, "total": 43}}, "SANTA BARBARA": {"DESPENSA DE ALIMENTOS": {"m": 132, "h": 80, "total": 212}, "HOSPEDAJE Y ALIMENTACION": {"m": 1, "h": 0, "total": 1}}, "SANTA ISABEL": {"DESPENSA DE ALIMENTOS": {"m": 145, "h": 71, "total": 216}}, "SATEVO": {"DESPENSA DE ALIMENTOS": {"m": 65, "h": 35, "total": 100}}, "SAUCILLO": {"DESPENSA DE ALIMENTOS": {"m": 201, "h": 99, "total": 300}}, "TEMOSACHIC": {"DESPENSA DE ALIMENTOS": {"m": 101, "h": 72, "total": 173}, "HOSPEDAJE Y ALIMENTACION": {"m": 0, "h": 1, "total": 1}}, "VALLE DE ZARAGOZA": {"DESPENSA DE ALIMENTOS": {"m": 50, "h": 24, "total": 74}}};

  /* ── KPI strip: fill the element that now exists in index.html ── */
  const kpiEl = document.getElementById('kpi-nutri');
  if (kpiEl) {
    kpiEl.innerHTML =
      kpiSS('Beneficiarios Localizables', fN(totalB),         'personas únicas con datos válidos','cgr','gr') +
      kpiSS('Apoyos Entregados',fN(totalA),              (totalA/totalB).toFixed(2)+' por beneficiario','cg','g') +
      kpiSS('Mujeres',          (totBM/totalB*100).toFixed(1)+'%', fN(totBM)+' beneficiarias','cf','f') +
      kpiSS('Rango Mayor',      ND.RLAB[rangoMax],       fN(ND.RT[rangoMax])+' benef.','cr','r') +
      kpiSS('Municipio Líder',  toTit(munsSort[0]?.n||'—'), fN(munsSort[0]?.t||0)+' beneficiarios','cb','b') +
      kpiSS('Mayor Cobertura',  toTit(munCobTop?.n||'—'),   munCobTop?munCobTop.cob.toFixed(1)+'% de su pob.':'—','cgr','gr') +
      kpiSS('Apoyo Mayor',      apTopLabel,             fN(apTop?.t||0)+' apoyos','cg','g') +
      kpiSS('Sin Cobertura',    '1', 'Manuel Benavides','cr','r');
  }

  /* ── slide nav + panels → into nutri-nav-panels ── */
  const navEl = document.getElementById('nutri-nav-panels');
  if (!navEl) return;
  navEl.innerHTML =
    '<div class="slide-nav-bar" style="margin-top:10px">' +
      '<button class="slide-nav-btn" onclick="nSw(+document.querySelector(\'.n-tab.active\')?.dataset.i-1)">' +
        '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>' +
      '</button>' +
      '<div class="slide-nav-tabs">' +
        '<button class="slide-nav-tab active n-tab" data-i="0" onclick="nSw(0)"><span class="snt-num">Sección I</span><span class="snt-title">Programas e<br>Instituciones</span><span class="snt-bar"></span></button>' +
        '<button class="slide-nav-tab n-tab" data-i="1" onclick="nSw(1)"><span class="snt-num">Sección II</span><span class="snt-title">Municipios</span><span class="snt-bar"></span></button>' +
        '<button class="slide-nav-tab n-tab" data-i="2" onclick="nSw(2)"><span class="snt-num">Sección III</span><span class="snt-title">Tipos de<br>Apoyo</span><span class="snt-bar"></span></button>' +
      '</div>' +
      '<button class="slide-nav-btn" onclick="nSw(+document.querySelector(\'.n-tab.active\')?.dataset.i+1)">' +
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
    const c      = NC[inst.nombre] || '#8b949e';
    const pM     = inst.benef>0 ? (inst.bm/inst.benef*100).toFixed(1) : 0;
    const pH     = (100-parseFloat(pM)).toFixed(1);
    const pct    = totalB>0 ? (inst.benef/totalB*100) : 0;
    const ringR  = 46, circ = 2*Math.PI*ringR;
    const dash   = (Math.min(pct/100,1)*circ).toFixed(1);
    const delay  = (ii*0.07).toFixed(2);
    const imgMap = {DIF:'imagenes/inst-dif.jpg', SDHyBC:'imagenes/inst-sdhybc.jpg', SPyCI:'imagenes/inst-spyci.jpg'};
    const imgSrc = imgMap[inst.nombre] || '';

    /* Real programs from ap_programas */
    const realProgs  = inst.ap_programas || [];
    const benefByProg = {};
    (inst.programas||[]).forEach(p => { benefByProg[p.n] = (benefByProg[p.n]||0) + p.t; });

    p0 += '<div class="nc-card" style="animation-delay:'+delay+'s">';
    p0 += '<div style="height:4px;background:'+c+'"></div>';
    p0 += '<div style="padding:18px;display:flex;flex-direction:column;gap:0">';

    /* ── HEADER: imagen con anillo + nombre + cifras ── */
    p0 += '<div style="display:flex;align-items:center;gap:14px;margin-bottom:14px">';
    /* imagen con anillo SVG — igual que GV */
    p0 += '<div style="position:relative;flex-shrink:0;width:110px;height:110px">';
    p0 += '<div style="position:absolute;inset:9px;border-radius:50%;overflow:hidden;background:#161b22">';
    if (imgSrc) {
      p0 += '<img src="'+imgSrc+'" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display=\'none\'"/>';
    }
    p0 += '</div>';
    p0 += '<svg width="110" height="110" viewBox="0 0 110 110" style="position:absolute;inset:0">';
    p0 += '<circle cx="55" cy="55" r="'+ringR+'" fill="none" stroke="rgba(205,217,229,.07)" stroke-width="8"/>';
    p0 += '<circle cx="55" cy="55" r="'+ringR+'" fill="none" stroke="'+c+'" stroke-width="8" stroke-linecap="round" stroke-dasharray="'+dash+' '+circ.toFixed(1)+'" transform="rotate(-90 55 55)"/>';
    p0 += '</svg>';
    p0 += '</div>';
    /* nombre, % del total como badge, cifras */
    p0 += '<div style="flex:1;min-width:0">';
    p0 += '<div style="font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;color:'+c+';margin-bottom:5px">'+inst.nombre+'</div>';
    p0 += '<div style="display:inline-flex;align-items:center;gap:5px;background:'+c+'18;border:1px solid '+c+'44;border-radius:8px;padding:3px 9px;margin-bottom:8px">';
    p0 += '<span style="font-family:DM Mono,monospace;font-size:15px;font-weight:400;color:'+c+'">'+pct.toFixed(1)+'%</span>';
    p0 += '<span style="font-size:11px;color:'+c+';opacity:.7">del programa</span>';
    p0 += '</div>';
    p0 += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px">';
    p0 += '<div style="background:#0d1117;border-radius:8px;padding:7px 10px">';
    p0 += '<div style="font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Beneficiarios</div>';
    p0 += '<div style="font-family:DM Mono,monospace;font-size:18px;font-weight:400;color:#e6edf3;line-height:1">'+fN(inst.benef)+'</div>';
    p0 += '</div>';
    p0 += '<div style="background:#0d1117;border-radius:8px;padding:7px 10px">';
    p0 += '<div style="font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:2px">Apoyos</div>';
    p0 += '<div style="font-family:DM Mono,monospace;font-size:18px;font-weight:400;color:'+c+';line-height:1">'+fN(inst.apoyos_total)+'</div>';
    p0 += '</div>';
    p0 += '</div>';
    p0 += '</div>';
    p0 += '</div>'; /* /header */

    /* ── sexo bar ── */
    p0 += '<div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:5px">';
    p0 += '<span style="color:#f778ba;font-weight:400">M '+pM+'%&ensp;'+fN(inst.bm)+'</span>';
    p0 += '<span style="color:#79c0ff;font-weight:400">'+fN(inst.bh)+'&ensp;H '+pH+'%</span>';
    p0 += '</div>';
    p0 += '<div style="display:flex;height:8px;border-radius:4px;overflow:hidden;margin-bottom:16px">';
    p0 += '<div style="width:'+pM+'%;background:#f778ba;opacity:.85"></div>';
    p0 += '<div style="width:'+pH+'%;background:#79c0ff;opacity:.7"></div>';
    p0 += '</div>';

    /* ── botón Más datos → modal ── */
    const safeInst = inst.nombre.replace(/'/g,'&#39;');
    p0 += '<div style="height:1px;background:rgba(205,217,229,.06)"></div>';
    p0 += '<div style="margin-top:12px">';
    p0 += '<button class="cat-ver-btn" style="width:100%;justify-content:center;font-size:12px;padding:8px 0" onclick="ncInstModal(\'' + safeInst + '\')">';
    p0 += '<svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" style="width:13px;height:13px"><circle cx="6" cy="6" r="5"/><path d="M6 4v4M4 6h4"/></svg>';
    p0 += ' Programas y Apoyos';
    p0 += '</button>';
    p0 += '</div>';

    p0 += '</div></div>'; /* /padding /card */
  });
  p0 += '</div>';

  /* rangos globales — pirámide de barras verticales */
  const maxRTV = Math.max(...RKEYS.map(r=>ND.RT[r]));
  const RCOL   = {'0-5':'#ffa657','6-11':'#56d364','12-17':'#79c0ff','18-29':'#f778ba',
                  '30-49':'#d2a8ff','50-64':'#39d353','65+':'#ff7b72'};

  /* ── Age chart: lollipop + stat row ── */
  p0 += '<div style="background:#161b22;border:1px solid rgba(205,217,229,.08);border-radius:14px;overflow:hidden">';

  /* stat summary row */
  p0 += '<div style="display:grid;grid-template-columns:repeat(7,1fr);border-bottom:1px solid rgba(205,217,229,.07)">';
  RKEYS.forEach(r => {
    const col = RCOL[r]||'#8b949e';
    const tot = ND.RT[r];
    const pctT = (tot/totalB*100).toFixed(1);
    const isDom = r === rangoMax;
    p0 += '<div style="padding:14px 6px 12px;text-align:center;border-right:1px solid rgba(205,217,229,.05);background:'+(isDom?'rgba(205,217,229,.04)':'transparent')+'">';
    p0 += '<div style="font-family:DM Mono,monospace;font-size:'+(isDom?'20':'17')+'px;font-weight:800;color:'+col+';letter-spacing:-.02em;line-height:1">'+fN(tot)+'</div>';
    p0 += '<div style="font-size:12px;color:#484f58;margin-top:4px;font-weight:600;letter-spacing:.04em">'+pctT+'%</div>';
    p0 += '</div>';
  });
  p0 += '</div>';

  /* chart area */
  p0 += '<div style="padding:20px 20px 0;position:relative">';

  /* grid lines de fondo */
  p0 += '<div style="position:absolute;inset:20px 20px 0;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none">';
  [100,75,50,25].forEach(pct => {
    p0 += '<div style="display:flex;align-items:center;gap:8px"><span style="font-size:9px;color:#2d333b;width:20px;text-align:right;flex-shrink:0">'+pct+'%</span><div style="flex:1;height:1px;background:rgba(205,217,229,.04)"></div></div>';
  });
  p0 += '</div>';

  /* barras lollipop */
  p0 += '<div style="display:grid;grid-template-columns:repeat(7,1fr);column-gap:8px;align-items:end;height:160px;padding-left:28px">';
  RKEYS.forEach(r => {
    const col = RCOL[r]||'#8b949e';
    const tot = ND.RT[r];
    const vm  = ND.RT_M[r]||0;
    const vh  = ND.RT_H[r]||0;
    const hM  = Math.max(6, Math.round(vm/maxRTV*150));
    const hH  = Math.max(6, Math.round(vh/maxRTV*150));
    const isDom = r === rangoMax;

    p0 += '<div style="display:flex;gap:5px;justify-content:center;align-items:flex-end;height:150px">';
    /* barra M con cabeza redonda */
    p0 += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:0">';
    p0 += '<div style="width:8px;height:8px;background:#f778ba;border-radius:50%;margin-bottom:-1px;opacity:.95;flex-shrink:0"></div>';
    p0 += '<div style="width:100%;background:linear-gradient(to top,#f778ba88,#f778ba22);border-radius:3px 3px 0 0;height:'+hM+'px"></div>';
    p0 += '</div>';
    /* barra H con cabeza redonda */
    p0 += '<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;gap:0">';
    p0 += '<div style="width:8px;height:8px;background:#79c0ff;border-radius:50%;margin-bottom:-1px;opacity:.85;flex-shrink:0"></div>';
    p0 += '<div style="width:100%;background:linear-gradient(to top,#79c0ff88,#79c0ff22);border-radius:3px 3px 0 0;height:'+hH+'px"></div>';
    p0 += '</div>';
    p0 += '</div>';
  });
  p0 += '</div>';
  p0 += '</div>';

  /* label bar */
  p0 += '<div style="display:grid;grid-template-columns:repeat(7,1fr);column-gap:8px;border-top:2px solid rgba(205,217,229,.06);margin-top:0">';
  RKEYS.forEach(r => {
    const col = RCOL[r]||'#8b949e';
    const tot = ND.RT[r];
    const vm  = ND.RT_M[r]||0;
    const vh  = ND.RT_H[r]||0;
    const pM  = tot>0?(vm/tot*100).toFixed(0):0;
    const pH  = 100-parseInt(pM);
    const isDom = r === rangoMax;
    p0 += '<div style="text-align:center;padding:10px 4px 14px;background:'+(isDom?'rgba(205,217,229,.03)':'transparent')+';border-top:2px solid '+(isDom?col:'transparent')+'">';
    p0 += '<div style="font-family:DM Mono,monospace;font-size:14px;font-weight:400;color:'+col+';margin-bottom:6px">'+ND.RLAB[r]+'</div>';
    p0 += '<div style="display:flex;justify-content:center;gap:12px;font-size:15px">';
    p0 += '<span style="color:#f778ba;font-family:DM Mono,monospace">M '+pM+'%</span>';
    p0 += '<span style="color:#79c0ff;font-family:DM Mono,monospace">H '+pH+'%</span>';
    p0 += '</div>';
    p0 += '</div>';
  });
  p0 += '</div>';

  /* footer leyenda */
  p0 += '<div style="display:flex;align-items:center;justify-content:center;gap:20px;padding:10px;border-top:1px solid rgba(205,217,229,.05);background:rgba(0,0,0,.15)">';
  p0 += '<span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:400;color:#f778ba"><span style="width:8px;height:8px;background:#f778ba;border-radius:50%"></span>Mujeres</span>';
  p0 += '<span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:400;color:#79c0ff"><span style="width:8px;height:8px;background:#79c0ff;border-radius:50%;opacity:.85"></span>Hombres</span>';
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
      ? '<span style="font-family:DM Mono,monospace;font-size:13px;font-weight:400;background:rgba(148,163,184,.08);color:#94a3b8;padding:3px 9px;border-radius:20px;border:.5px solid rgba(148,163,184,.2)">'+(m.t/pob*100).toFixed(1)+'%</span>'
      : '<span style="opacity:.3;color:#484f58">—</span>';
    const munRangos = RKEYS.map(r=>({r,tot:(m.rm[r]||0)+(m.rh[r]||0)})).filter(x=>x.tot>0);
    const rMax = munRangos.length ? munRangos.reduce((a,b)=>b.tot>a.tot?b:a).r : null;
    const rMin = munRangos.length>1 ? munRangos.reduce((a,b)=>b.tot<a.tot?b:a).r : null;
    const rMaxP = rMax ? '<span style="font-size:12px;font-weight:400;background:rgba(56,139,253,.15);color:#79c0ff;padding:2px 8px;border-radius:20px;border:.5px solid rgba(56,139,253,.25)">'+ND.RLAB[rMax]+'</span>' : '<span style="opacity:.3;color:#484f58">—</span>';
    const rMinP = rMin ? '<span style="font-size:12px;font-weight:400;background:rgba(255,166,87,.12);color:#ffa657;padding:2px 8px;border-radius:20px;border:.5px solid rgba(255,166,87,.25)">'+ND.RLAB[rMin]+'</span>' : '<span style="opacity:.3;color:#484f58">—</span>';
    const bg = i%2===0?'':'background:rgba(205,217,229,.02)';
    const TD = 'padding:9px 8px;border-bottom:1px solid rgba(205,217,229,.06)';
    mRows +=
      '<tr style="'+bg+'">' +
      '<td style="'+TD+';text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;color:#484f58;background:rgba(205,217,229,.06);padding:2px 7px;border-radius:20px;border:.5px solid rgba(205,217,229,.08)">'+(i+1)+'</span></td>' +
      '<td style="'+TD+';padding-left:14px"><span style="font-weight:400;font-size:14px;color:#e6edf3;font-family:DM Sans,system-ui,sans-serif">'+toTit(m.n)+'</span></td>' +
      '<td style="'+TD+'"><div style="display:flex;align-items:center;gap:7px"><div style="width:44px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+barB+'%;background:#388bfd;border-radius:2px"></div></div><span style="font-family:DM Mono,monospace;font-size:14px;color:#e6edf3">'+fN(m.t)+'</span></div></td>' +
      '<td style="'+TD+';text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;font-weight:400;color:#f778ba">'+fN(m.m)+'</span><div style="font-size:11px;color:#484f58">'+pM2+'%</div></td>' +
      '<td style="'+TD+';text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;font-weight:400;color:#79c0ff">'+fN(m.h)+'</span><div style="font-size:11px;color:#484f58">'+pH2+'%</div></td>' +
      '<td style="'+TD+';text-align:center">'+cob+'</td>' +
      '<td style="'+TD+'"><div style="display:flex;align-items:center;gap:7px"><div style="width:44px;height:4px;background:rgba(205,217,229,.1);border-radius:2px;overflow:hidden"><div style="height:100%;width:'+barA+'%;background:#e3b341;border-radius:2px"></div></div><span style="font-family:DM Mono,monospace;font-size:14px;color:#e3b341">'+fN(m.at||0)+'</span></div></td>' +
      '<td style="'+TD+';text-align:center"><button data-n="'+m.n+'" onclick="ncMunModal(this.dataset.n)" style="font-size:11px;font-weight:600;color:#79c0ff;background:rgba(56,139,253,.1);border:0.5px solid rgba(56,139,253,.3);border-radius:6px;padding:4px 10px;cursor:pointer;white-space:nowrap">Ver</button></td>' +
      '<td style="'+TD+';text-align:center">'+rMaxP+'</td>' +
      '<td style="'+TD+';text-align:center">'+rMinP+'</td>' +
      '</tr>';
  });
  /* total row */
  mRows +=
    '<tr style="background:#161b22;border-top:1px solid rgba(205,217,229,.2)">' +
    '<td style="padding:12px 8px;text-align:center"><span style="font-family:DM Mono,monospace;font-size:13px;color:#484f58">Σ</span></td>' +
    '<td style="padding:12px 14px;font-family:DM Sans,system-ui,sans-serif;font-size:13px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#8b949e">Total · '+ND.muns.length+' municipios</td>' +
    '<td style="padding:12px 8px"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:400;color:#388bfd">'+fN(totalB)+'</span></td>' +
    '<td style="padding:12px 8px;text-align:center"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:400;color:#f778ba">'+fN(totBM)+'</span></td>' +
    '<td style="padding:12px 8px;text-align:center"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:400;color:#79c0ff">'+fN(totBH)+'</span></td>' +
    '<td></td>' +
    '<td style="padding:12px 8px"><span style="font-family:DM Mono,monospace;font-size:14px;font-weight:400;color:#e3b341">'+fN(totApAll)+'</span></td>' +
    '<td></td><td></td><td></td>' +
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
      '<th style="'+TH+';text-align:center"></th>' +
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
    p2 += '<span style="color:#f778ba;font-weight:400">M '+fN(ap.m)+'</span>';
    p2 += '<span style="color:#79c0ff;font-weight:400">'+fN(ap.h)+' H</span>';
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

  /* ── modal Programas y Apoyos por institución ── */
  window.ncInstModal = function(nombre) {
    const inst = window._ncInsts?.find(i => i.nombre === nombre);
    if (!inst) return;
    const c = {DIF:'#DB2777',SDHyBC:'#1D9E75',SPyCI:'#C2410C'}[nombre] || '#8b949e';
    const realProgs = inst.ap_programas || [];

    /* reusar el cat-modal-overlay existente */
    const overlay = document.getElementById('cat-modal-overlay');
    const titleEl = document.getElementById('cat-modal-title');
    const subEl   = document.getElementById('cat-modal-sub');
    const bodyEl  = document.getElementById('cat-modal-body');
    const tabsEl  = document.getElementById('cat-modal-tabs');
    if (!overlay || !bodyEl) return;

    titleEl.textContent = nombre + ' · NutriChihuahua';
    subEl.textContent   = fN(inst.benef) + ' beneficiarios · ' + fN(inst.apoyos_total) + ' apoyos';
    if (tabsEl) tabsEl.style.display = 'none';

    /* beneficiarios por programa */
    const benefByProg = {};
    (inst.programas||[]).forEach(p => { benefByProg[p.n] = (benefByProg[p.n]||0) + p.t; });
    const maxP = Math.max(...realProgs.map(rp => benefByProg[rp.n]||rp.t), 1);

    /* apoyos agregados */
    const allAps = [];
    realProgs.forEach(rp => (rp.apoyos||[]).forEach(a => {
      const ex = allAps.find(x=>x.n===a.n);
      if (ex) { ex.t+=a.t; ex.m+=a.m; ex.h+=a.h; } else allAps.push({...a});
    }));
    allAps.sort((a,b)=>b.t-a.t);

    let html = '';

    /* programas */
    html += '<div style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58;margin-bottom:10px">Programas — Beneficiarios</div>';
    realProgs.forEach(rp => {
      const benef = benefByProg[rp.n] || rp.t;
      const w = ((benef/maxP)*100).toFixed(1);
      const progBenef = (inst.programas||[]).find(p=>p.n===rp.n);
      const pMp = progBenef && progBenef.t>0 ? (progBenef.m/progBenef.t*100).toFixed(0) : 0;
      html += '<div style="margin-bottom:12px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">';
      html += '<span style="font-size:13px;color:#cdd9e5;font-weight:600">' + toTit(rp.n) + '</span>';
      html += '<span style="font-family:DM Mono,monospace;font-size:14px;font-weight:400;color:#e6edf3">' + fN(benef) + '<span style="font-size:11px;font-weight:400;color:#484f58;margin-left:4px">benef.</span></span>';
      html += '</div>';
      html += '<div style="height:6px;background:rgba(205,217,229,.07);border-radius:3px;overflow:hidden;margin-bottom:4px">';
      html += '<div style="height:100%;width:'+w+'%;background:'+c+';border-radius:3px;opacity:.7"></div></div>';
      html += '<div style="font-size:11px;color:#484f58">M '+pMp+'% · H '+(100-parseInt(pMp))+'%</div>';
      html += '</div>';
    });

    /* divider */
    html += '<div style="height:1px;background:rgba(205,217,229,.08);margin:4px 0 14px"></div>';

    /* apoyos */
    html += '<div style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58;margin-bottom:10px">Apoyos Entregados — '+fN(inst.apoyos_total)+'</div>';
    allAps.forEach(a => {
      const w2 = ((a.t/inst.apoyos_total)*100).toFixed(1);
      const pMa = a.t>0 ? (a.m/a.t*100).toFixed(0) : 0;
      html += '<div style="margin-bottom:12px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px">';
      html += '<span style="font-size:13px;color:#cdd9e5;font-weight:600">' + toTit(a.n) + '</span>';
      html += '<span style="font-family:DM Mono,monospace;font-size:14px;font-weight:400;color:'+c+'">' + fN(a.t) + '<span style="font-size:11px;font-weight:400;color:#484f58;margin-left:4px">apoyos</span></span>';
      html += '</div>';
      html += '<div style="height:6px;background:rgba(205,217,229,.07);border-radius:3px;overflow:hidden;margin-bottom:4px">';
      html += '<div style="height:100%;width:'+w2+'%;background:'+c+';border-radius:3px;opacity:.45"></div></div>';
      html += '<div style="font-size:11px;color:#484f58">M '+pMa+'% · H '+(100-parseInt(pMa))+'% · ' + pN(a.t,inst.apoyos_total) + ' del total</div>';
      html += '</div>';
    });

    bodyEl.innerHTML = html;
    overlay.classList.remove('hidden');
  };

  /* ── modal Ver Apoyos por municipio ── */
  window.ncMunModal = function(nombre) {
    const m = window._ncMuns?.find(x => x.n === nombre);
    if (!m) return;
    const overlay = document.getElementById('cat-modal-overlay');
    const titleEl = document.getElementById('cat-modal-title');
    const subEl   = document.getElementById('cat-modal-sub');
    const bodyEl  = document.getElementById('cat-modal-body');
    const tabsEl  = document.getElementById('cat-modal-tabs');
    if (!overlay || !bodyEl) return;

    titleEl.textContent = toTit(nombre) + ' · Apoyos NutriChihuahua';
    subEl.textContent   = fN(m.at) + ' apoyos entregados · ' + fN(m.t) + ' beneficiarios';
    if (tabsEl) tabsEl.style.display = 'none';

    const pctM = m.at>0 ? (m.am/m.at*100).toFixed(1) : 0;
    const pctH = (100-parseFloat(pctM)).toFixed(1);
    const apVsBen = m.t>0 ? (m.at/m.t).toFixed(2) : '—';
    const RCOLM = {'0-5':'#ffa657','6-11':'#56d364','12-17':'#79c0ff','18-29':'#f778ba',
                   '30-49':'#d2a8ff','50-64':'#39d353','65+':'#ff7b72'};
    const maxR = Math.max(...ND.RANGOS.map(r=>(m.rm[r]||0)+(m.rh[r]||0)));

    /* lookup per-mun apoyo data from Excel parse */
    const munKey = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase();
    const apData = (window._ncMunAp || {})[munKey] || {};
    const apKeys = Object.keys(apData).sort((a,b)=>apData[b].total-apData[a].total);
    const ACOL = {
      'DESPENSA DE ALIMENTOS':                     '#e3b341',
      'ASISTENCIA ALIMENTARIA EN ESPACIO COMUN':   '#3fb950',
      'HOSPEDAJE Y ALIMENTACION':                  '#79c0ff',
      'PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA':'#d2a8ff'
    };
    let html = '';

    /* KPIs */
    html += '<div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px">';
    html += '<div style="background:#0d1117;border-radius:8px;padding:10px 12px;text-align:center">';
    html += '<div style="font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Total apoyos</div>';
    html += '<div style="font-family:DM Mono,monospace;font-size:22px;font-weight:400;color:#e3b341">'+fN(m.at)+'</div></div>';
    html += '<div style="background:#0d1117;border-radius:8px;padding:10px 12px;text-align:center">';
    html += '<div style="font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Beneficiarios</div>';
    html += '<div style="font-family:DM Mono,monospace;font-size:22px;font-weight:400;color:#388bfd">'+fN(m.t)+'</div></div>';
    html += '<div style="background:#0d1117;border-radius:8px;padding:10px 12px;text-align:center">';
    html += '<div style="font-size:10px;color:#484f58;text-transform:uppercase;letter-spacing:.08em;margin-bottom:4px">Ratio</div>';
    html += '<div style="font-family:DM Mono,monospace;font-size:22px;font-weight:400;color:#8b949e">'+apVsBen+'</div></div>';
    html += '</div>';

    /* barra M/H */
    html += '<div style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58;margin-bottom:8px">Distribución por sexo · Apoyos</div>';
    html += '<div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:5px">';
    html += '<span style="color:#f778ba;font-weight:400">M '+pctM+'% &ensp; '+fN(m.am)+'</span>';
    html += '<span style="color:#79c0ff;font-weight:400">'+fN(m.ah)+' &ensp; H '+pctH+'%</span></div>';
    html += '<div style="display:flex;height:10px;border-radius:5px;overflow:hidden;margin-bottom:16px">';
    html += '<div style="width:'+pctM+'%;background:#f778ba;opacity:.85"></div>';
    html += '<div style="width:'+pctH+'%;background:#79c0ff;opacity:.7"></div></div>';

    /* apoyos reales por municipio desde Excel */
    html += '<div style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58;margin-bottom:10px">Apoyos entregados por tipo</div>';
    /* apoyo → instituciones que lo entregan en NutriChihuahua */
    const AP_INST = {
      'DESPENSA DE ALIMENTOS':                    ['DIF','SDHyBC'],
      'ASISTENCIA ALIMENTARIA EN ESPACIO COMUN':  ['DIF','SDHyBC','SPyCI'],
      'HOSPEDAJE Y ALIMENTACION':                 ['SPyCI'],
      'PAQUETE DE ALIMENTOS E INSUMOS DE LIMPIEZA':['DIF'],
    };
    const NC2 = {DIF:'#DB2777', SDHyBC:'#1D9E75', SPyCI:'#C2410C'};
    if (apKeys.length) {
      const maxA2 = apData[apKeys[0]].total;
      apKeys.forEach(ap => {
        const v    = apData[ap];
        const col  = ACOL[ap] || '#8b949e';
        const w    = (v.total/maxA2*100).toFixed(1);
        const pM2  = v.total>0 ? (v.m/v.total*100).toFixed(0) : 0;
        const pH2  = 100-parseInt(pM2);
        const insts = AP_INST[ap] || [];
        html += '<div style="margin-bottom:14px">';
        html += '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;gap:8px">';
        html += '<div style="display:flex;align-items:center;gap:8px;min-width:0">';
        html += '<div style="width:10px;height:10px;border-radius:50%;background:'+col+';flex-shrink:0"></div>';
        html += '<span style="font-size:13px;font-weight:600;color:#e6edf3;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+toTit(ap)+'</span>';
        html += '</div>';
        html += '<div style="display:flex;align-items:center;gap:5px;flex-shrink:0">';
        insts.forEach(ins => { const ic=NC2[ins]||'#8b949e'; html += '<span style="font-size:10px;font-weight:700;color:'+ic+';background:'+ic+'18;border:1px solid '+ic+'44;border-radius:4px;padding:1px 6px">'+ins+'</span>'; });
        html += '<span style="font-family:DM Mono,monospace;font-size:15px;font-weight:400;color:'+col+'">'+fN(v.total)+'</span>';
        html += '</div></div>';
        html += '<div style="height:8px;background:rgba(205,217,229,.06);border-radius:4px;overflow:hidden;margin-bottom:4px">';
        html += '<div style="height:100%;width:'+w+'%;background:'+col+';border-radius:4px;opacity:.8"></div></div>';
        html += '<div style="display:flex;justify-content:space-between;font-size:11px">';
        html += '<span style="color:#f778ba">M '+pM2+'% · '+fN(v.m)+'</span>';
        html += '<span style="color:#79c0ff">'+fN(v.h)+' · H '+pH2+'%</span>';
        html += '</div></div>';
      });
    } else {
      html += '<div style="padding:12px;text-align:center;color:#484f58;font-size:13px">Sin desglose disponible</div>';
    }

    /* rangos de edad */
    html += '<div style="font-size:10px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#484f58;margin:12px 0 10px">Distribución por edad · Beneficiarios</div>';
    (window._ncRKEYS||[]).forEach((r,ri) => {
      const vm = m.rm[r]||0, vh = m.rh[r]||0, tot = vm+vh;
      if (!tot) return;
      const w  = maxR>0 ? (tot/maxR*100).toFixed(1) : 0;
      const wm = maxR>0 ? (vm/maxR*100).toFixed(1)  : 0;
      const col = RCOLM[r]||'#8b949e';
      html += '<div style="margin-bottom:8px">';
      html += '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px">';
      html += '<span style="font-size:13px;font-weight:600;color:'+col+'">'+(window._ncRLAB||{})[r]+'</span>';
      html += '<span style="font-family:DM Mono,monospace;font-size:13px;color:'+col+'">'+fN(tot)+'</span></div>';
      html += '<div style="height:8px;background:rgba(205,217,229,.06);border-radius:4px;overflow:hidden;position:relative">';
      html += '<div style="position:absolute;height:100%;width:'+w+'%;background:'+col+';border-radius:4px;opacity:.35"></div>';
      html += '<div style="position:absolute;height:100%;width:'+wm+'%;background:'+col+';border-radius:4px;opacity:.9"></div>';
      html += '</div></div>';
    });

    bodyEl.innerHTML = html;
    overlay.classList.remove('hidden');
  };

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
