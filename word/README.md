# word/

Documentação do Sankofa em **Microsoft Word (.docx)**, gerada a partir dos `.md` do repositório via `pandoc`.

| Ficheiro                                | Origem                | Descrição                                  |
|-----------------------------------------|-----------------------|--------------------------------------------|
| `00-README.docx`                        | `/README.md`          | Visão geral do projeto                     |
| `01-Conceito.docx`                      | `docs/CONCEITO.md`    | Tese, problema, princípios                 |
| `02-Roadmap.docx`                       | `docs/ROADMAP.md`     | Fases 0–4                                  |
| `03-Audio.docx`                         | `docs/AUDIO.md`       | Motor de instrumentos africanos            |
| `04-Liga.docx`                          | `docs/LIGA.md`        | Liga dos Griôs (Supabase)                  |
| `05-Monetizacao.docx`                   | `docs/MONETIZACAO.md` | Estratégia nacional + internacional        |
| `06-Pitch-Deck.docx`                    | `docs/PITCH-DECK.md`  | 10 slides para apresentação                |
| `07-Cartas.docx`                        | `docs/CARTAS.md`      | Templates ESG/UNESCO/Prefeitura/Escola     |
| `08-One-Pager.docx`                     | `docs/ONE-PAGER.md`   | Folheto frente/verso para rua              |
| `09-Documentacao-Completa.docx`         | todos                 | Volume único com sumário e capa            |

## Regenerar

```bash
bash scripts/build-docx.sh
```

Idempotente. Sobrescreve sempre.

## Editar

Abre em **Microsoft Word**, **LibreOffice Writer**, **Google Docs** (upload), **Apple Pages** ou **Notion** (importar).

A fonte canônica continua sendo `.md`. Edições no `.docx` não voltam para o repositório automaticamente — se quiseres preservar mudanças, atualiza o `.md` correspondente.
