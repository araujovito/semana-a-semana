"""Auditoria: mostra, por alimento, (1) quais campos da TACO nao eram numericos e cairam no USDA em silencio,
(2) a razao de energia TACO/USDA (umidade diferente distorce os micronutrientes emprestados do USDA).
So leitura. Rodar: python3 -I empresa/relatorios/auditoria/conferir_fontes.py"""
import csv, io, json, os, re, zipfile, sys
RAIZ = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
src = open(os.path.join(RAIZ, "dados", "gerar_alimentos.py"), encoding="utf-8").read()
ns = {"__file__": os.path.join(RAIZ, "dados", "gerar_alimentos.py")}
exec(src.split("def main")[0], ns)
AL, NUT = ns["ALIMENTOS"], ns["NUTRIENTES"]
taco = {x["id"]: x for x in json.load(open(os.path.join(RAIZ, "dados", "fontes", "taco.json"), encoding="utf-8"))}
z = zipfile.ZipFile(os.path.join(RAIZ, "dados", "fontes", "usda_sr_legacy.zip"))
def ler(nome):
    arq = [n for n in z.namelist() if n.endswith("/" + nome)][0]
    return csv.DictReader(io.TextIOWrapper(z.open(arq), encoding="utf-8"))
por_desc = {}; desc = {}
for r in ler("food.csv"): por_desc[r["description"]] = r["fdc_id"]; desc[r["fdc_id"]] = r["description"]
ids = {}
for a in AL:
    u = a[3]
    if isinstance(u, str): u = por_desc[u]
    ids[a[0]] = str(u) if u else None
usda = {u: {} for u in ids.values() if u}
for r in ler("food_nutrient.csv"):
    if r["fdc_id"] in usda: usda[r["fdc_id"]][r["nutrient_id"]] = float(r["amount"] or 0)
if "--nutr" in sys.argv:
    for r in ler("nutrient.csv"):
        if r["id"] in [v[1] for v in NUT.values()]: print(r)
print("%-17s %6s %6s %5s | campos TACO nao numericos (valor TACO -> valor USDA usado)" % ("chave", "kcalT", "kcalU", "T/U"))
for chave, nome, tid, uid, med, g, grupo in AL:
    t = taco.get(tid, {}) if tid else {}
    u = usda.get(ids[chave], {}) if ids[chave] else {}
    caiu = []
    for campo, (ct, cu) in NUT.items():
        if ct is None: continue
        v = t.get(ct)
        if tid and not isinstance(v, (int, float)): caiu.append("%s:%r->%s" % (campo, v, u.get(cu, "sem USDA=0")))
    kt, ku = t.get("energy_kcal"), u.get("1008")
    raz = "%5.2f" % (kt / ku) if isinstance(kt, (int, float)) and ku else "  -  "
    print("%-17s %6s %6s %s | %s" % (chave, "%.0f" % kt if isinstance(kt, (int, float)) else "-", "%.0f" % ku if ku else "-", raz, " ".join(caiu)))
