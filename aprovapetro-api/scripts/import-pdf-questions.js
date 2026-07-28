const parsedQuestions = [
  {
    "topicId": "f4d3de1c-4e42-4492-aa52-061feb9aa8d9",
    "bank": "CESGRANRIO",
    "year": 2010,
    "statement": "Prova: Técnico de Operação Júnior (2010).\nDuas amostras de metal foram testadas em laboratório através da análise do comportamento das mesmas na presença de ácidos fortes concentrados. Os resultados dos testes indicaram que: O metal X não reagiu com HCl mas liberou gás com HNO3. O metal Y liberou gás com ambos.\nDe acordo com os potenciais padrão (NO3- = +0,96V, Cu2+ = +0,34V, 2H+ = 0V, Zn2+ = -0,76V), o metal:",
    "correctOption": 2,
    "explanation": "Pela análise de reatividade, o metal com potencial de redução maior que o H+ (como o Cu) não reage com HCl, mas reage com HNO3, logo o metal X pode ser Cu. O metal Y reage com HCl, então tem potencial menor que H+ (ex: Zn). A afirmativa correta afirma que Y não pode ser o Cobre, pois o cobre não reagiria com HCl concentrado.",
    "options": [
      "A) X não pode ser o cobre, pois este não sofreria reação com HNO3 concentrado.",
      "B) X não pode ser o zinco, pois este não sofreria reação com HNO3 concentrado.",
      "C) Y não pode ser o cobre, pois este não sofreria reação com HCl concentrado.",
      "D) Y não pode ser o zinco, pois este não sofreria reação com HCl concentrado.",
      "E) Y não pode ser o cobre, pois este não sofreria reação com HNO3 concentrado."
    ]
  },
  {
    "topicId": "f4d3de1c-4e42-4492-aa52-061feb9aa8d9",
    "bank": "CESGRANRIO",
    "year": 2010,
    "statement": "Prova: Técnico de Operação Júnior (2010).\nSeja a equação termoquímica a seguir: CO2(g) + H2(g) -> CO(g) + H2O(g) ΔH0 = +41,2 KJ/mol. Sabendo-se que os calores de formação padrão para H2O(g) e Fe2O3(s) são iguais a -241,8 kJ/mol e -824,8 kJ/mol, respectivamente, a variação de entalpia no estado padrão para a reação Fe2O3(s) + 3CO(g) -> 2Fe(s) + 3CO2(g) será igual a:",
    "correctOption": 1,
    "explanation": "Calculando a Lei de Hess com as reações dadas, encontramos que o valor é -24,2 kJ/mol.",
    "options": [
      "A) - 12,1 kJ/mol",
      "B) - 24,2 kJ/mol",
      "C) - 32,3 kJ/mol",
      "D) - 42,4 kJ/mol",
      "E) - 58,2 kJ/mol"
    ]
  }
];

fetch('http://localhost:3001/api/admin/questions/import', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ questions: parsedQuestions })
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);
