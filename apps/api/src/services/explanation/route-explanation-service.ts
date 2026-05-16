import type {
  RouteCandidate,
  RouteMetrics,
  RouteScores
} from "@route5/shared";

export type RouteExplanationInput = {
  scores: RouteScores;
  metrics: RouteMetrics;
  confidence?: RouteCandidate["confidence"];
};

export type RouteExplanation = {
  description: string;
  labels: string[];
  cautions: string[];
};

const baseCaution =
  "地図データに基づく推定です。工事、交通状況、天候、夜間の明るさは現地で確認してください。";

const lowConfidenceCaution =
  "現在は推定値を含みます。実際の道の状態と異なる場合があります。";

export class RouteExplanationService {
  explainRoute(input: RouteExplanationInput): RouteExplanation {
    const labels = unique(this.buildLabels(input)).slice(0, 4);
    const cautions = unique(this.buildCautions(input));

    return {
      description: this.buildDescription(input),
      labels,
      cautions
    };
  }

  private buildDescription({ scores, metrics }: RouteExplanationInput) {
    const reasons = this.buildDescriptionReasons(scores, metrics);
    const totalFit =
      scores.total >= 85
        ? "条件にかなり合いやすい"
        : scores.total >= 70
          ? "条件に合いやすい"
          : "条件に合う部分と注意したい部分がある";

    if (reasons.length === 0) {
      return `${totalFit}推定ルートです。詳しい道の状態は現地で確認してください。`;
    }

    return `${reasons.join("、")}が特徴の、${totalFit}推定ルートです。詳しい道の状態は現地で確認してください。`;
  }

  private buildDescriptionReasons(
    scores: RouteScores,
    metrics: RouteMetrics
  ) {
    const reasons: string[] = [];

    if (scores.flatness >= 82 && metrics.ascentM <= 25) {
      reasons.push("坂が少なめ");
    } else if (scores.flatness <= 45 || (metrics.maxSlopePercent ?? 0) >= 7) {
      reasons.push("坂の負荷が高め");
    }

    if (scores.surfaceComfort >= 80 || (metrics.pavedRatio ?? 0) >= 0.85) {
      reasons.push("舗装路中心");
    } else if ((metrics.unpavedRatio ?? 0) >= 0.25) {
      reasons.push("未舗装区間が多め");
    }

    if (scores.parkAndWater >= 65) {
      reasons.push("公園や水辺の要素が多め");
    } else if ((metrics.parkRatio ?? 0) >= 0.25) {
      reasons.push("公園に寄りやすい");
    } else if ((metrics.watersideRatio ?? 0) >= 0.2) {
      reasons.push("水辺に寄りやすい");
    }

    if ((metrics.quietScore ?? 0) >= 72) {
      reasons.push("落ち着いた道の目安がある");
    }

    return reasons.slice(0, 3);
  }

  private buildLabels({ scores, metrics }: RouteExplanationInput) {
    const labels: string[] = [];

    if (scores.total >= 85) {
      labels.push("条件に合いやすい");
    }

    if (scores.flatness >= 82 && metrics.ascentM <= 25) {
      labels.push("坂少なめ");
    }

    if (scores.flatness <= 45 || metrics.ascentM >= 60) {
      labels.push("坂トレ向き");
    }

    if (scores.surfaceComfort >= 80 || (metrics.pavedRatio ?? 0) >= 0.85) {
      labels.push("舗装路中心");
    }

    if ((metrics.unpavedRatio ?? 0) >= 0.25) {
      labels.push("未舗装あり");
    }

    if ((metrics.parkRatio ?? 0) >= 0.25) {
      labels.push("公園多め");
    }

    if ((metrics.watersideRatio ?? 0) >= 0.2) {
      labels.push("水辺あり");
    }

    if (scores.shade >= 65 || (metrics.shadeScore ?? 0) >= 65) {
      labels.push("日陰多め");
    }

    if ((metrics.quietScore ?? 0) >= 72) {
      labels.push("静かな道の目安");
    }

    if ((metrics.busyRoadScore ?? 0) >= 75) {
      labels.push("人通り多めの目安");
    }

    if (scores.uniqueness >= 80) {
      labels.push("違いが出やすい");
    }

    return labels.length > 0 ? labels : ["推定ルート"];
  }

  private buildCautions({ scores, metrics, confidence }: RouteExplanationInput) {
    const cautions = [baseCaution];

    if (confidence === "low") {
      cautions.push(lowConfidenceCaution);
    }

    if (scores.flatness <= 45 || (metrics.maxSlopePercent ?? 0) >= 7) {
      cautions.push(
        "坂がきつく感じる可能性があります。体調に合わせて無理せず調整してください。"
      );
    }

    if ((metrics.unpavedRatio ?? 0) >= 0.25) {
      cautions.push(
        "未舗装区間が多い可能性があります。雨上がりは足元を確認してください。"
      );
    }

    if ((metrics.shadeScore ?? 50) < 45) {
      cautions.push(
        "日陰が少ない可能性があります。暑い日は休憩や水分補給を意識してください。"
      );
    }

    if ((metrics.busyRoadScore ?? 50) >= 75) {
      cautions.push(
        "大きめの通りを含む目安です。横断時は信号や車の流れを確認してください。"
      );
    }

    return cautions;
  }
}

const unique = (values: string[]) => Array.from(new Set(values));
