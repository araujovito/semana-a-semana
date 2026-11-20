"""Gera app/alimentos.js a partir da TACO (4a ed., NEPA/Unicamp) e do USDA SR Legacy.

Regra por nutriente: valor da TACO quando numerico; senao USDA; senao 0.
B12, D, folato, E e K nao existem na TACO, entao vem sempre do USDA.
Rodar com: python3 -I dados/gerar_alimentos.py
"""
import csv, io, json, os, zipfile

AQUI = os.path.dirname(os.path.abspath(__file__))
RAIZ = os.path.dirname(AQUI)

# chave, nome, id TACO, id USDA (fdc_id), medida caseira, gramas da medida, grupo
ALIMENTOS = [
 ("frango_peito","Peito de frango grelhado",410,171477,"filé médio",100,"proteina"),
 ("frango_sobrecoxa","Sobrecoxa de frango assada, sem pele",413,172388,"sobrecoxa sem osso",90,"proteina"),
 ("carne_patinho","Patinho grelhado",377,168649,"bife médio",100,"proteina"),
 ("carne_moida","Carne moída (acém) cozida",326,171794,"colher de sopa cheia",25,"proteina"),
 ("carne_musculo","Músculo bovino cozido",371,169442,"pedaço médio",40,"proteina"),
 ("porco_lombo","Lombo de porco assado",432,168233,"fatia média",60,"proteina"),
 ("ovo","Ovo cozido",488,173424,"unidade",50,"proteina"),
 ("atum","Atum em conserva (óleo, drenado)",277,173708,"lata drenada",120,"proteina"),
 ("sardinha","Sardinha em conserva (óleo, drenada)",319,175139,"lata drenada",84,"proteina"),
 ("salmao","Salmão grelhado",317,175168,"filé pequeno",100,"proteina"),
 ("merluza","Merluza assada",301,"Fish, whiting, mixed species, cooked, dry heat","filé médio",100,"proteina"),
 ("tilapia","Tilápia grelhada",None,175177,"filé médio",100,"proteina"),
 ("tofu","Tofu",584,172475,"fatia média",60,"proteina"),
 ("whey","Whey protein isolado (pó)",None,173177,"medida (scoop)",30,"proteina"),
 ("iogurte","Iogurte natural integral",448,171284,"pote",170,"laticinio"),
 ("iogurte_desn","Iogurte natural desnatado",449,170887,"pote",170,"laticinio"),
 ("leite","Leite integral",458,172217,"copo",200,"laticinio"),
 ("leite_desn","Leite desnatado",457,173432,"copo",200,"laticinio"),
 ("leite_po_desn","Leite em pó desnatado",456,170877,"colher de sopa",10,"laticinio"),
 # USDA 172224 (queso blanco) e nao 172223 (queso fresco): o queso fresco americano traz 2,7 ug de vitamina D por 100 g,
 # quatro a sete vezes os outros queijos de leite integral da mesma base (0,4 a 0,7), sinal de leite com vitamina D adicionada.
 # O minas frescal brasileiro e feito de leite sem adicao.
 ("queijo_minas","Queijo minas frescal",461,172224,"fatia média",30,"laticinio"),
 ("ricota","Ricota",469,170851,"fatia média",35,"laticinio"),
 ("mozarela","Queijo mozarela",463,170845,"fatia",20,"laticinio"),
 ("feijao_carioca","Feijão carioca cozido",561,175200,"concha pequena",80,"leguminosa"),
 ("feijao_preto","Feijão preto cozido",567,173735,"concha pequena",80,"leguminosa"),
 ("lentilha","Lentilha cozida",577,172421,"concha pequena",80,"leguminosa"),
 ("grao_bico","Grão-de-bico cozido",None,173757,"colher de sopa cheia",25,"leguminosa"),
 ("arroz_integral","Arroz integral cozido",1,169704,"colher de sopa cheia",25,"carboidrato"),
 ("arroz_branco","Arroz branco cozido",3,169757,"colher de sopa cheia",25,"carboidrato"),
 ("aveia","Aveia em flocos",7,173904,"colher de sopa",15,"carboidrato"),
 ("pao_integral","Pão de forma integral",52,172688,"fatia",25,"carboidrato"),
 ("pao_frances","Pão francês",53,172675,"unidade",50,"carboidrato"),
 ("batata_doce","Batata-doce cozida",88,168484,"rodela média",40,"carboidrato"),
 ("batata","Batata inglesa cozida",91,170440,"unidade pequena",80,"carboidrato"),
 ("mandioca","Mandioca cozida",129,None,"pedaço médio",50,"carboidrato"),
 ("cuscuz","Cuscuz de milho",533,None,"fatia média",80,"carboidrato"),
 ("abobora","Abóbora cabotiá cozida",64,170490,"colher de sopa cheia",30,"vegetal"),
 ("brocolis","Brócolis cozido",100,169967,"ramo médio",25,"vegetal"),
 ("couve","Couve refogada",116,169238,"colher de sopa cheia",20,"vegetal"),
 ("espinafre","Espinafre refogado",120,168463,"colher de sopa cheia",25,"vegetal"),
 ("cenoura_crua","Cenoura crua ralada",110,170393,"colher de sopa",12,"vegetal"),
 ("cenoura_coz","Cenoura cozida",109,170394,"colher de sopa cheia",25,"vegetal"),
 ("tomate","Tomate",157,170457,"unidade pequena",80,"vegetal"),
 ("alface","Alface",78,169249,"folha",10,"vegetal"),
 ("abobrinha","Abobrinha cozida",70,169292,"colher de sopa cheia",30,"vegetal"),
 ("chuchu","Chuchu cozido",112,170403,"colher de sopa cheia",30,"vegetal"),
 ("beterraba","Beterraba cozida",97,169146,"colher de sopa cheia",20,"vegetal"),
 ("couve_flor","Couve-flor cozida",118,170397,"ramo médio",30,"vegetal"),
 ("pepino","Pepino",142,168409,"colher de sopa (picado)",18,"vegetal"),
 ("rucula","Rúcula",152,169387,"prato de sobremesa",20,"vegetal"),
 ("repolho","Repolho cru",149,169975,"colher de sopa (picado)",10,"vegetal"),
 ("banana","Banana-prata",182,173944,"unidade",70,"fruta"),
 ("mamao","Mamão papaia",226,169926,"fatia média",100,"fruta"),
 ("laranja","Laranja-pera",214,169097,"unidade",130,"fruta"),
 ("maca","Maçã fuji",222,171688,"unidade pequena",110,"fruta"),
 ("morango","Morango",239,167762,"unidade",12,"fruta"),
 ("goiaba","Goiaba vermelha",200,173044,"unidade média",170,"fruta"),
 ("manga","Manga palmer",229,169910,"fatia média",60,"fruta"),
 ("abacate","Abacate",163,171705,"colher de sopa cheia",30,"gordura"),
 ("kiwi","Kiwi",207,168153,"unidade",75,"fruta"),
 ("melao","Melão",236,169092,"fatia média",90,"fruta"),
 ("melancia","Melancia",235,167765,"fatia média",200,"fruta"),
 ("abacaxi","Abacaxi",164,169124,"fatia média",75,"fruta"),
 ("tangerina","Tangerina poncã",251,169105,"unidade",135,"fruta"),
 ("ameixa_seca","Ameixa seca",None,168162,"unidade",8,"fruta"),
 ("azeite","Azeite de oliva",260,171413,"colher de sopa",8,"gordura"),
 ("castanha_brasil","Castanha-do-pará",589,170569,"unidade",4,"gordura"),
 ("castanha_caju","Castanha de caju torrada",588,169421,"unidade",2.5,"gordura"),
 ("amendoim","Amendoim torrado",558,174262,"colher de sopa",17,"gordura"),
 ("linhaca","Linhaça",594,169414,"colher de sopa",10,"gordura"),
 ("gergelim","Gergelim",593,170150,"colher de sopa",8,"gordura"),
 ("noz","Noz",597,170187,"unidade",5,"gordura"),
 ("agua_coco","Água de coco",478,170174,"copo",200,"bebida"),
 # Acrescentados para subir ferro e vitamina E com pouco volume. Medidas caseiras a conferir com tabela publicada.
 ("semente_girassol","Semente de girassol torrada, sem casca e sem sal",None,170563,"colher de sopa",10,"gordura"),
 ("semente_abobora","Semente de abóbora torrada, sem casca e sem sal",None,170557,"colher de sopa",10,"gordura"),
 ("amendoa","Amêndoa torrada",587,170158,"unidade",1.2,"gordura"),
 ("oleo_girassol","Óleo de girassol",269,171025,"colher de sopa",8,"gordura"),
 # Cacau em po nao e gordura; fica neste grupo porque se usa como as sementes (por cima do iogurte) e o grupo nao entra na tabela de trocas.
 ("cacau_po","Cacau em pó sem açúcar",None,169593,"colher de sopa",6,"gordura"),
 ("agriao","Agrião",75,170068,"prato de sobremesa",20,"vegetal"),
 # Opcoes para quem tem restricao (nao estao no cardapio base).
 # Bebida de soja: so USDA, de proposito. A TACO 582 e a versao sem calcio adicionado e os valores dela passariam na frente.
 # E um produto americano com calcio, vitamina A e vitamina D adicionados; a marca brasileira pode nao ter os tres.
 ("bebida_soja","Bebida de soja com cálcio adicionado",None,172456,"copo",200,"laticinio"),
 ("soja_cozida","Soja em grão cozida",None,174271,"colher de sopa cheia",25,"proteina"),
 ("ervilha","Ervilha em conserva, escorrida",560,170013,"colher de sopa cheia",25,"leguminosa"),
 ("tapioca","Tapioca com manteiga",551,None,"unidade pequena",50,"carboidrato"),
]

# O que cada alimento contem, para as restricoes do perfil. Marcas usadas pelo app:
#   leite (lactose/leite), ovo, peixe, carne_vermelha, porco, gluten, carne (qualquer carne, ave ou peixe: e o que a vegetariana nao come).
# Aveia entra como gluten por cautela: no Brasil a aveia comum e rotulada "contem gluten" por contaminacao cruzada.
# Alimento novo de origem animal ou com trigo/aveia/cevada/centeio TEM de entrar aqui.
CONTEM = {
 "frango_peito": ["carne"], "frango_sobrecoxa": ["carne"],
 "carne_patinho": ["carne", "carne_vermelha"], "carne_moida": ["carne", "carne_vermelha"], "carne_musculo": ["carne", "carne_vermelha"],
 "porco_lombo": ["carne", "porco"], "ovo": ["ovo"],
 "atum": ["carne", "peixe"], "sardinha": ["carne", "peixe"], "salmao": ["carne", "peixe"], "merluza": ["carne", "peixe"], "tilapia": ["carne", "peixe"],
 "whey": ["leite"], "iogurte": ["leite"], "iogurte_desn": ["leite"], "leite": ["leite"], "leite_desn": ["leite"], "leite_po_desn": ["leite"],
 "queijo_minas": ["leite"], "ricota": ["leite"], "mozarela": ["leite"],
 "aveia": ["gluten"], "pao_integral": ["gluten"], "pao_frances": ["gluten"],
 "tapioca": ["leite"],  # a da TACO leva manteiga
}
# Setor do mercado, para a lista de compras. Quem nao esta em SETOR_DA_CHAVE usa o setor do grupo.
SETORES = ["Hortifrúti", "Carnes e peixes", "Frios e laticínios", "Padaria", "Mercearia", "Bebidas"]
SETOR_DO_GRUPO = {"proteina": "Carnes e peixes", "laticinio": "Frios e laticínios", "leguminosa": "Mercearia", "carboidrato": "Mercearia",
                  "vegetal": "Hortifrúti", "fruta": "Hortifrúti", "gordura": "Mercearia", "bebida": "Bebidas"}
SETOR_DA_CHAVE = {"ovo": "Frios e laticínios", "atum": "Mercearia", "sardinha": "Mercearia", "tofu": "Frios e laticínios", "whey": "Mercearia",
                  "leite_po_desn": "Mercearia", "pao_integral": "Padaria", "pao_frances": "Padaria", "batata_doce": "Hortifrúti", "batata": "Hortifrúti",
                  "mandioca": "Hortifrúti", "abacate": "Hortifrúti", "bebida_soja": "Bebidas", "soja_cozida": "Mercearia"}

# campo de saida -> (campo TACO, id do nutriente no USDA)
NUTRIENTES = {
 "kcal": ("energy_kcal", "1008"), "prot": ("protein_g", "1003"), "gord": ("lipid_g", "1004"),
 "carb": ("carbohydrate_g", "1005"), "fibra": ("fiber_g", "1079"),
 "ca": ("calcium_mg", "1087"), "fe": ("iron_mg", "1089"), "mg": ("magnesium_mg", "1090"),
 "zn": ("zinc_mg", "1095"), "k": ("potassium_mg", "1092"), "vitc": ("vitaminC_mg", "1162"),
 "vita": ("rae_mcg", "1106"), "b1": ("thiamine_mg", "1165"),
 "b12": (None, "1178"), "vitd": (None, "1114"), "folato": (None, "1190"),
 "vite": (None, "1109"), "vitk": (None, "1185"),
}

def main():
    taco = {x["id"]: x for x in json.load(open(os.path.join(AQUI, "fontes", "taco.json"), encoding="utf-8"))}
    z = zipfile.ZipFile(os.path.join(AQUI, "fontes", "usda_sr_legacy.zip"))
    def ler(nome):
        arq = [n for n in z.namelist() if n.endswith("/" + nome)][0]
        return csv.DictReader(io.TextIOWrapper(z.open(arq), encoding="utf-8"))
    desc = {}
    por_desc = {}
    for r in ler("food.csv"):
        desc[r["fdc_id"]] = r["description"]; por_desc[r["description"]] = r["fdc_id"]
    usados = set()
    for a in ALIMENTOS:
        u = a[3]
        if isinstance(u, str): u = por_desc[u]
        if u: usados.add(str(u))
    usda = {u: {} for u in usados}
    for r in ler("food_nutrient.csv"):
        if r["fdc_id"] in usda: usda[r["fdc_id"]][r["nutrient_id"]] = float(r["amount"] or 0)

    saida = {}
    for chave, nome, tid, uid, medida, g_medida, grupo in ALIMENTOS:
        if isinstance(uid, str): uid = por_desc[uid]
        uid = str(uid) if uid else None
        t = taco.get(tid, {}) if tid else {}
        setor = SETOR_DA_CHAVE.get(chave) or SETOR_DO_GRUPO[grupo]
        assert setor in SETORES, chave
        item = {"nome": nome, "medida": medida, "gMedida": g_medida, "grupo": grupo, "setor": setor, "contem": CONTEM.get(chave, []),
                "fonte": ("TACO %d" % tid if tid else "") + (" + " if tid and uid else "") + ("USDA %s" % uid if uid else "")}
        for campo, (ct, cu) in NUTRIENTES.items():
            v = t.get(ct) if ct else None
            if not isinstance(v, (int, float)):
                v = usda.get(uid, {}).get(cu, 0) if uid else 0
            item[campo] = round(v, 2)
        saida[chave] = item
        print("%-17s %-40s | %s" % (chave, (t.get("description") or "-")[:40], desc.get(uid, "-")[:60]))
    for chave in CONTEM: assert chave in saida, "CONTEM cita alimento inexistente: " + chave
    with open(os.path.join(RAIZ, "app", "alimentos.js"), "w", encoding="utf-8") as f:
        f.write("// Gerado por dados/gerar_alimentos.py. Valores por 100 g. Nao editar a mao.\n")
        f.write("window.ALIMENTOS = " + json.dumps(saida, ensure_ascii=False, indent=1) + ";\n")
    print(len(saida), "alimentos")

main()
