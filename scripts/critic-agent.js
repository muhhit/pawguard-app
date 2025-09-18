#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");

class CriticAgent {
  constructor() {
    this.name = "CRITIC-AGENT";
    this.reviewedTasks = new Map();
    this.qualityScores = new Map();
    this.issues = [];
    this.recommendations = [];
  }

  async reviewAllTasks() {
    console.log(`🔍 [${this.name}] T0-T177 arası tüm görevleri incelemeye başlıyor...`);
    
    const tasksDir = path.resolve(process.cwd(), "spec_tasks");
    if (!fs.existsSync(tasksDir)) {
      console.log(`❌ [${this.name}] spec_tasks klasörü bulunamadı!`);
      return;
    }

    const entries = fs.readdirSync(tasksDir);
    let reviewedCount = 0;
    let qualityIssues = 0;
    let excellentTasks = 0;

    for (const entry of entries) {
      if (!entry.startsWith('T') && !entry.startsWith('FIX-')) continue;
      
      const taskPath = path.join(tasksDir, entry);
      const statusPath = path.join(taskPath, "status.json");
      
      if (fs.existsSync(statusPath)) {
        const review = await this.reviewTask(entry, taskPath);
        reviewedCount++;
        
        if (review.qualityScore >= 9) excellentTasks++;
        if (review.qualityScore < 7) qualityIssues++;
      }
    }

    console.log(`\n📊 [${this.name}] İNCELEME RAPORU:`);
    console.log(`✅ İncelenen görev sayısı: ${reviewedCount}`);
    console.log(`🌟 Mükemmel görevler (9-10/10): ${excellentTasks}`);
    console.log(`⚠️  Kalite sorunu olan görevler (<7/10): ${qualityIssues}`);
    console.log(`📈 Ortalama kalite skoru: ${this.calculateAverageScore()}/10`);

    await this.generateDetailedReport();
    await this.provideCriticalRecommendations();
  }

  async reviewTask(taskId, taskPath) {
    const statusPath = path.join(taskPath, "status.json");
    const artifactsPath = path.join(taskPath, "artifacts");
    
    let status = {};
    try {
      status = JSON.parse(fs.readFileSync(statusPath, "utf8"));
    } catch (error) {
      console.log(`⚠️  [${this.name}] ${taskId} status.json okunamadı`);
    }

    const review = {
      taskId,
      qualityScore: 0,
      completeness: 0,
      codeQuality: 0,
      documentation: 0,
      testing: 0,
      innovation: 0,
      issues: [],
      strengths: [],
      recommendations: []
    };

    // Tamamlanma durumu kontrolü
    if (status.state === 'completed') {
      review.completeness = 10;
      review.strengths.push("Görev başarıyla tamamlanmış");
    } else if (status.state === 'in_progress') {
      review.completeness = 5;
      review.issues.push("Görev henüz tamamlanmamış");
    } else {
      review.completeness = 0;
      review.issues.push("Görev başlatılmamış veya hazırlanmamış");
    }

    // Artifacts kontrolü
    if (fs.existsSync(artifactsPath)) {
      const artifacts = fs.readdirSync(artifactsPath);
      
      // Kod dosyaları
      const codeFiles = artifacts.filter(f => f.endsWith('.ts') || f.endsWith('.js') || f.endsWith('.tsx') || f.endsWith('.jsx'));
      if (codeFiles.length > 0) {
        review.codeQuality = Math.min(10, codeFiles.length * 2);
        review.strengths.push(`${codeFiles.length} kod dosyası oluşturulmuş`);
      } else {
        review.codeQuality = 0;
        review.issues.push("Kod dosyası bulunamadı");
      }

      // Dokümantasyon
      const docFiles = artifacts.filter(f => f.endsWith('.md') || f.toLowerCase().includes('readme'));
      if (docFiles.length > 0) {
        review.documentation = Math.min(10, docFiles.length * 3);
        review.strengths.push(`${docFiles.length} dokümantasyon dosyası mevcut`);
      } else {
        review.documentation = 0;
        review.issues.push("Dokümantasyon eksik");
      }

      // Test dosyaları
      const testFiles = artifacts.filter(f => f.includes('test') || f.includes('spec'));
      if (testFiles.length > 0) {
        review.testing = Math.min(10, testFiles.length * 2);
        review.strengths.push(`${testFiles.length} test dosyası oluşturulmuş`);
      } else {
        review.testing = 0;
        review.issues.push("Test dosyası bulunamadı");
      }

      // İnovasyon skoru (unicorn potential'a göre)
      if (status.unicornPotential) {
        review.innovation = status.unicornPotential * 2;
        if (status.unicornPotential >= 4) {
          review.strengths.push("Yüksek inovasyon potansiyeli");
        }
      }

    } else {
      review.issues.push("Artifacts klasörü bulunamadı - hiçbir çıktı üretilmemiş");
    }

    // Genel kalite skoru hesaplama
    review.qualityScore = Math.round(
      (review.completeness * 0.3 + 
       review.codeQuality * 0.25 + 
       review.documentation * 0.2 + 
       review.testing * 0.15 + 
       review.innovation * 0.1)
    );

    // Kritik öneriler
    if (review.qualityScore < 5) {
      review.recommendations.push("🚨 ACIL: Bu görev tamamen yeniden yapılmalı");
    } else if (review.qualityScore < 7) {
      review.recommendations.push("⚠️ Bu görev iyileştirme gerektirir");
    } else if (review.qualityScore >= 9) {
      review.recommendations.push("✨ Mükemmel kalite - örnek alınabilir");
    }

    this.reviewedTasks.set(taskId, review);
    this.qualityScores.set(taskId, review.qualityScore);

    // Kısa özet yazdır
    const statusIcon = review.qualityScore >= 8 ? "✅" : review.qualityScore >= 6 ? "⚠️" : "❌";
    console.log(`${statusIcon} [${this.name}] ${taskId}: ${review.qualityScore}/10 (${status.state || 'unknown'})`);

    return review;
  }

  calculateAverageScore() {
    if (this.qualityScores.size === 0) return 0;
    const total = Array.from(this.qualityScores.values()).reduce((sum, score) => sum + score, 0);
    return Math.round((total / this.qualityScores.size) * 10) / 10;
  }

  async generateDetailedReport() {
    const reportPath = path.join(process.cwd(), "critic-review-report.json");
    
    const report = {
      timestamp: new Date().toISOString(),
      agent: this.name,
      summary: {
        totalTasks: this.reviewedTasks.size,
        averageQuality: this.calculateAverageScore(),
        excellentTasks: Array.from(this.qualityScores.values()).filter(score => score >= 9).length,
        goodTasks: Array.from(this.qualityScores.values()).filter(score => score >= 7 && score < 9).length,
        poorTasks: Array.from(this.qualityScores.values()).filter(score => score < 7).length,
        criticalTasks: Array.from(this.qualityScores.values()).filter(score => score < 5).length
      },
      taskReviews: Object.fromEntries(this.reviewedTasks),
      topPerformers: this.getTopPerformers(),
      worstPerformers: this.getWorstPerformers(),
      systemRecommendations: this.getSystemRecommendations()
    };

    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`\n📄 [${this.name}] Detaylı rapor kaydedildi: ${reportPath}`);
  }

  getTopPerformers() {
    return Array.from(this.qualityScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([taskId, score]) => ({ taskId, score }));
  }

  getWorstPerformers() {
    return Array.from(this.qualityScores.entries())
      .sort((a, b) => a[1] - b[1])
      .slice(0, 10)
      .map(([taskId, score]) => ({ taskId, score }));
  }

  getSystemRecommendations() {
    const avgScore = this.calculateAverageScore();
    const recommendations = [];

    if (avgScore < 6) {
      recommendations.push("🚨 SİSTEM KRİTİK: Genel kalite çok düşük, tüm sistem gözden geçirilmeli");
    } else if (avgScore < 7.5) {
      recommendations.push("⚠️ Sistem kalitesi orta seviyede, iyileştirme gerekli");
    } else if (avgScore >= 8.5) {
      recommendations.push("✅ Sistem kalitesi mükemmel seviyede");
    }

    const criticalCount = Array.from(this.qualityScores.values()).filter(score => score < 5).length;
    if (criticalCount > 0) {
      recommendations.push(`🔥 ${criticalCount} kritik görev acilen düzeltilmeli`);
    }

    const excellentCount = Array.from(this.qualityScores.values()).filter(score => score >= 9).length;
    if (excellentCount > 10) {
      recommendations.push(`🌟 ${excellentCount} mükemmel görev var - bu kalite standardı korunmalı`);
    }

    return recommendations;
  }

  async provideCriticalRecommendations() {
    console.log(`\n🎯 [${this.name}] KRİTİK ÖNERİLER:`);
    
    const worstTasks = this.getWorstPerformers().slice(0, 5);
    if (worstTasks.length > 0) {
      console.log(`\n❌ EN KÖTÜ PERFORMANS GÖSTEREN GÖREVLER:`);
      worstTasks.forEach(task => {
        const review = this.reviewedTasks.get(task.taskId);
        console.log(`   ${task.taskId}: ${task.score}/10`);
        review.issues.forEach(issue => console.log(`     - ${issue}`));
      });
    }

    const bestTasks = this.getTopPerformers().slice(0, 5);
    if (bestTasks.length > 0) {
      console.log(`\n✅ EN İYİ PERFORMANS GÖSTEREN GÖREVLER:`);
      bestTasks.forEach(task => {
        console.log(`   ${task.taskId}: ${task.score}/10`);
      });
    }

    console.log(`\n🔧 SİSTEM ÖNERİLERİ:`);
    this.getSystemRecommendations().forEach(rec => console.log(`   ${rec}`));
  }
}

// Ana çalıştırma
async function main() {
  const critic = new CriticAgent();
  await critic.reviewAllTasks();
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = CriticAgent;
