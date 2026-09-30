import Link from "next/link";
import { Droplets } from "lucide-react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { EmptyLogArt } from "@/components/illustrations";
import { WeekChart } from "@/components/history/WeekChart";
import { HistoryCalendar, type CelulaDia } from "@/components/history/HistoryCalendar";
import { TodayLog } from "@/components/log/TodayLog";
import { MacroBars } from "@/components/dashboard/MacroBars";
import { ExportButton } from "@/components/history/ExportButton";
import { resumoDoDia, resumoPorDia, serieUltimosDias, obterMeta } from "@/lib/day";
import {
  chaveDoDia,
  deChaveDoDia,
  diasDoIntervalo,
  fmtDiaCompleto,
  isFuture,
  rotuloDoDia,
  startOfCalendario,
  fimDoCalendario,
  mesDaChave,
  chaveDoMes,
  mesAnteriorDe,
  mesSeguinteDe,
} from "@/lib/historico";
import { fmtNum } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function HistoricoPage({ searchParams }: { searchParams: { dia?: string; mes?: string } }) {
  const hoje = new Date();
  const mesChave = searchParams.mes && /^\d{4}-\d{2}$/.test(searchParams.mes) ? searchParams.mes : chaveDoMes(hoje);
  const mes = mesDaChave(mesChave);

  const diaSelecionado =
    searchParams.dia && /^\d{4}-\d{2}-\d{2}$/.test(searchParams.dia) ? deChaveDoDia(searchParams.dia) : hoje;
  const diaValido = isFuture(diaSelecionado) ? hoje : diaSelecionado;

  const inicioGrade = startOfCalendario(mes);
  const fimGrade = fimDoCalendario(mes);

  const [serie, doMes, detalhe, meta] = await Promise.all([
    serieUltimosDias(7),
    resumoPorDia(inicioGrade, fimGrade),
    resumoDoDia(diaValido),
    obterMeta(),
  ]);

  const porChave = new Map(doMes.map((d) => [d.chave, d]));
  const celulas: CelulaDia[] = diasDoIntervalo(inicioGrade, fimGrade).map((d) => {
    const chave = chaveDoDia(d);
    const r = porChave.get(chave);
    return {
      chave,
      data: d.toISOString(),
      kcal: r?.kcal ?? 0,
      aguaMl: r?.aguaMl ?? 0,
      temRegistro: Boolean(r && (r.refeicoes > 0 || r.aguaMl > 0)),
      doMes: d.getMonth() === mes.getMonth(),
    };
  });

  const soDoMes = doMes.filter((d) => d.data.getMonth() === mes.getMonth());
  const diasComRegistro = soDoMes.filter((d) => d.refeicoes > 0 || d.aguaMl > 0);
  const totalRegistros = soDoMes.reduce((a, d) => a + d.refeicoes, 0);
  const mediaKcal = diasComRegistro.length > 0 ? diasComRegistro.reduce((a, d) => a + d.kcal, 0) / diasComRegistro.length : 0;

  const chaveSel = chaveDoDia(diaValido);
  const mesSeguinte = mesSeguinteDe(mesChave, hoje);

  return (
    <div className="space-y-10">
      <PageHeader
        eyebrow="O que já passou"
        title="Histórico"
        subtitle="Seus últimos dias de calorias e água, com o detalhe de cada um."
        action={<ExportButton />}
      />

      <Card className="p-6 md:p-8">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-2xl font-light">Últimos 7 dias</h2>
          {mediaKcal > 0 && (
            <p className="text-sm text-text-muted">
              média no mês <span className="num-display text-lg text-text">{fmtNum(Math.round(mediaKcal))}</span> kcal
            </p>
          )}
        </div>
        <WeekChart dias={serie.dias} metaCalorica={meta.metaCalorica} metaAguaMl={meta.metaAguaMl} selecionado={chaveSel} />
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start">
        <Card alt className="p-5">
          <HistoryCalendar
            celulas={celulas}
            mesAtual={mesChave}
            mesAnterior={mesAnteriorDe(mesChave)}
            mesSeguinte={mesSeguinte}
            metaCalorica={meta.metaCalorica}
            selecionado={chaveSel}
          />
          <p className="mt-4 text-xs text-text-muted">
            {totalRegistros > 0
              ? `${totalRegistros} ${totalRegistros === 1 ? "refeição registrada" : "refeições registradas"} neste mês.`
              : "Nenhuma refeição registrada neste mês."}
          </p>
        </Card>

        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm text-text-muted">{rotuloDoDia(diaValido)}</p>
                <h2 className="mt-1 font-display text-2xl font-light">{fmtDiaCompleto(diaValido)}</h2>
              </div>
              {chaveSel === chaveDoDia(hoje) && (
                <ButtonLink href="/registrar" variant="soft" size="sm">
                  Registrar algo
                </ButtonLink>
              )}
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <p className="num-display text-4xl">{fmtNum(Math.round(detalhe.kcal))}</p>
                <p className="mt-1 text-sm text-text-muted">de {fmtNum(meta.metaCalorica)} kcal</p>
              </div>
              <div>
                <p className="num-display text-4xl">{fmtNum(detalhe.aguaMl)}</p>
                <p className="mt-1 flex items-center gap-1 text-sm text-text-muted">
                  <Droplets size={13} /> de {fmtNum(meta.metaAguaMl)} ml
                </p>
              </div>
            </div>

            {detalhe.kcal > 0 && (
              <div className="mt-5">
                <MacroBars proteina={detalhe.proteina} carboidrato={detalhe.carboidrato} gordura={detalhe.gordura} />
              </div>
            )}
          </Card>

          <Card className="p-5">
            {detalhe.refeicoes.length === 0 && detalhe.agua.length === 0 ? (
              <EmptyState
                art={<EmptyLogArt />}
                title="Dia sem anotações"
                text="Nada foi registrado neste dia. Escolha outro no calendário ao lado."
              />
            ) : (
              <>
                <TodayLog refeicoes={detalhe.refeicoes} titulo="No prato" somenteLeitura={chaveSel !== chaveDoDia(hoje)} />
                {detalhe.agua.length > 0 && (
                  <p className="mt-5 border-t border-line pt-4 text-sm text-text-muted">
                    {detalhe.agua.length} {detalhe.agua.length === 1 ? "copo" : "copos"} de água somando{" "}
                    <span className="num-display text-lg text-text">{fmtNum(detalhe.aguaMl)}</span> ml.
                  </p>
                )}
              </>
            )}
          </Card>

          {chaveSel !== chaveDoDia(hoje) && (
            <p className="text-center text-xs text-text-muted">
              Editar e apagar só valem para hoje.{" "}
              <Link href="/historico" className="underline underline-offset-2">
                Voltar para hoje
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
