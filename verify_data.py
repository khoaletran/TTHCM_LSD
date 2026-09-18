import re, json

with open('src/data/questions_lsd.js', 'r', encoding='utf-8') as f:
    text = f.read()
    json_str = text.split('export const questionsLSD = ')[1].rstrip(';\n ')
    lsd = json.loads(json_str)

with open('src/data/questions_tthcm.js', 'r', encoding='utf-8') as f:
    text = f.read()
    json_str = text.split('export const questionsTTHCM = ')[1].rstrip(';\n ')
    tthcm = json.loads(json_str)

print("=== DATA INTEGRITY VERIFICATION ===")
print(f"LSD questions count: {len(lsd)} (Expected: 736)")
assert len(lsd) == 736, f"LSD count mismatch: {len(lsd)}"

print(f"TTHCM questions count: {len(tthcm)} (Expected: 707)")
assert len(tthcm) == 707, f"TTHCM count mismatch: {len(tthcm)}"

print(f"Total questions: {len(lsd) + len(tthcm)} (Expected: 1443)")
assert len(lsd) + len(tthcm) == 1443, "Total count mismatch!"

# Check LSD items
lsd_ids = set()
for i, q in enumerate(lsd):
    assert 'id' in q and isinstance(q['id'], int), f"LSD item {i} missing valid id"
    assert q['id'] not in lsd_ids, f"Duplicate ID in LSD: {q['id']}"
    lsd_ids.add(q['id'])
    assert 'q' in q and isinstance(q['q'], str) and len(q['q'].strip()) > 0, f"LSD item {i} has empty q"
    assert 'options' in q and isinstance(q['options'], list) and len(q['options']) >= 2, f"LSD item {i} invalid options"
    assert 'answer' in q and isinstance(q['answer'], int) and 0 <= q['answer'] < len(q['options']), f"LSD item {i} invalid answer index: {q['answer']}"

# Check TTHCM items
tthcm_ids = set()
for i, q in enumerate(tthcm):
    assert 'id' in q and isinstance(q['id'], int), f"TTHCM item {i} missing valid id"
    assert q['id'] not in tthcm_ids, f"Duplicate ID in TTHCM: {q['id']}"
    tthcm_ids.add(q['id'])
    assert 'q' in q and isinstance(q['q'], str) and len(q['q'].strip()) > 0, f"TTHCM item {i} has empty q"
    assert 'options' in q and isinstance(q['options'], list) and len(q['options']) >= 2, f"TTHCM item {i} invalid options"
    assert 'answer' in q and isinstance(q['answer'], int) and 0 <= q['answer'] < len(q['options']), f"TTHCM item {i} invalid answer index: {q['answer']}"

print("All 1,443 questions validated successfully with 100% schema integrity!")
