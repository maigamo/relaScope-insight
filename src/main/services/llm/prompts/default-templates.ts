import { PromptTemplate } from '../types';

/**
 * 默认的提示词模板集合
 * 提供一些内置的通用模板
 */
export const defaultPromptTemplates: PromptTemplate[] = [
  {
    id: 'hexagon-personality-model',
    name: '六边形人格模型分析',
    description: '根据用户个人资料、语录和经历分析六边形人格模型',
    template: `你是一名经验丰富的心理分析师，擅长通过人物的语录、经历和个人资料来分析其性格特质。
你需要根据提供的信息，对此人进行六边形人格模型分析。

六边形人格模型包含六个维度，具体如下：
1. 安全感(Security): 衡量一个人对稳定、安全与确定性的需求程度。高分表示强烈需要确定性与安全感；低分表示更能接受不确定性和风险。
2. 成就感(Achievement): 衡量一个人对目标达成和能力展示的重视程度。高分表示强烈的成就动机和竞争意识；低分表示较少关注外在成就和比较。
3. 自由感(Freedom): 衡量一个人对独立自主和不受束缚的渴望。高分表示高度珍视个人自由和独立决策能力；低分表示更能接受外部规范和约束。
4. 归属感(Belonging): 衡量一个人对社交联系和集体认同的需要。高分表示强烈需要社交连接和归属；低分表示更倾向于独处和自足。
5. 新奇感(Novelty): 衡量一个人对新事物和变化的开放程度。高分表示热爱变化和新鲜刺激；低分表示更喜欢熟悉和常规。
6. 控制感(Control): 衡量一个人对掌控环境和生活的需求。高分表示强烈需要掌控感和条理；低分表示更随性和适应力强。

请分析以下信息，并给出该人在六边形人格模型各维度上的得分(0-10分)及详细分析：

个人资料：
{{profile}}

语录集合：
{{quotes}}

经历记录：
{{experiences}}

请以JSON格式返回你的分析结果：
{
  "security": {
    "score": [0-10的整数],
    "analysis": "对安全感维度的详细分析...",
    "evidence": ["支持分析的关键证据1", "支持分析的关键证据2", "..."]
  },
  "achievement": {
    "score": [0-10的整数],
    "analysis": "对成就感维度的详细分析...",
    "evidence": ["支持分析的关键证据1", "支持分析的关键证据2", "..."]
  },
  "freedom": {
    "score": [0-10的整数],
    "analysis": "对自由感维度的详细分析...",
    "evidence": ["支持分析的关键证据1", "支持分析的关键证据2", "..."]
  },
  "belonging": {
    "score": [0-10的整数],
    "analysis": "对归属感维度的详细分析...",
    "evidence": ["支持分析的关键证据1", "支持分析的关键证据2", "..."]
  },
  "novelty": {
    "score": [0-10的整数],
    "analysis": "对新奇感维度的详细分析...",
    "evidence": ["支持分析的关键证据1", "支持分析的关键证据2", "..."]
  },
  "control": {
    "score": [0-10的整数],
    "analysis": "对控制感维度的详细分析...",
    "evidence": ["支持分析的关键证据1", "支持分析的关键证据2", "..."]
  },
  "overallAnalysis": "综合所有维度的整体人格分析..."
}`,
    variables: ['profile', 'quotes', 'experiences'],
    category: '人格分析',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'how-to-deal-with',
    name: '如何与此人相处',
    description: '基于六边形人格模型分析如何与此人相处',
    template: `你是一名专业的人际关系顾问，擅长根据人格分析给出与不同类型人相处的建议。
请根据以下六边形人格模型分析结果，给出与此人相处的具体建议：

六边形人格模型分析结果：
{{hexagonModelResult}}

请从以下几个方面提供与此人相处的建议：
1. 沟通方式：如何与此人有效沟通
2. 合作模式：如何与此人有效合作
3. 冲突处理：如何处理与此人的潜在冲突
4. 激励方式：如何激励和支持此人
5. 界限设置：如何设置恰当的关系界限
6. 建立信任：如何与此人建立信任

请给出具体、可操作的建议，而非泛泛而谈。建议应该基于人格分析结果，针对性强且容易实施。`,
    variables: ['hexagonModelResult'],
    category: '人际关系',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'how-to-sell-to',
    name: '如何向此人销售',
    description: '基于六边形人格模型分析如何向此人销售产品或服务',
    template: `你是一名资深销售顾问，擅长根据客户的人格特质定制销售策略。
请根据以下六边形人格模型分析结果，制定向此人销售产品或服务的策略：

六边形人格模型分析结果：
{{hexagonModelResult}}

产品或服务描述：
{{productDescription}}

请从以下几个方面提供销售策略：
1. 价值主张：应该强调产品/服务的哪些价值点
2. 沟通风格：应该采用什么样的沟通方式
3. 解决痛点：如何针对此人的特点解决其潜在痛点
4. 异议处理：可能遇到的异议及如何应对
5. 成交技巧：适合此人的成交策略
6. 后续跟进：如何与此人建立长期关系

请给出具体、可操作的销售策略，确保策略与此人的人格特质高度匹配。`,
    variables: ['hexagonModelResult', 'productDescription'],
    category: '销售策略',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'personal-growth-advice',
    name: '个人成长建议',
    description: '基于六边形人格模型提供个人成长建议',
    template: `你是一名个人成长教练，擅长根据人格分析帮助人们找到合适的成长路径。
请根据以下六边形人格模型分析结果，为此人提供个人成长建议：

六边形人格模型分析结果：
{{hexagonModelResult}}

个人目标：
{{personalGoals}}

请从以下几个方面提供个人成长建议：
1. 优势发挥：如何更好地发挥个人优势
2. 短板提升：如何有效提升薄弱方面
3. 自我认知：如何提高自我认知和情绪管理能力
4. 习惯培养：建议培养哪些有益习惯
5. 学习方向：适合的学习和发展方向
6. 潜力挖掘：如何挖掘更多的个人潜力

请提供具体、可实施的建议，并考虑此人的现有特质和目标。建议应该是有针对性的，且符合个人成长的科学原则。`,
    variables: ['hexagonModelResult', 'personalGoals'],
    category: '个人发展',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]; 