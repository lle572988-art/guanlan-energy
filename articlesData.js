/**
 * PassTerra Authority — Articles Database
 * 
 * 架构说明：
 *   - articlesDb 是纯文本结构化数据文件
 *   - 前端 article-detail.html 通过 URL 参数 ?id=xxx 读取对应文章
 *   - 新文章直接往这个数组里追加即可
 *
 * 字段说明：
 *   id         → 唯一标识符，格式 "art" + 序号
 *   category   → 分类标签 (ownership / agency / contract / finance / exam-tips / glossary)
 *   title      → 文章标题
 *   official   → 官方/学术定义或背景（如适用）
 *   layman     → PassTerra 极客大白话正文
 *   traps      → 考点陷阱列表（每条一句话）
 */

const articlesDb = [
  {
    id: "art01",
    category: "ownership",
    title: "Fee Simple vs. Life Estate: The Ultimate Showdown of Property Estates",
    official: "Fee Simple Absolute is the highest form of real property ownership recognized by law, granting the holder full possessory rights for an indefinite duration, freely transferable and inheritable. A Life Estate is a freehold estate whose duration is measured by the lifetime of a designated person, terminating automatically upon their death.",
    layman: "Fee Simple = you own it forever, sell it, burn it down, leave it to your cat. Life Estate = you own it until you die, then it auto-transfers to someone else (the remainderman). Think of it as 'renting from yourself with an expiration date tattooed on your forehead.' Exam loves: the life tenant can't sell a fee simple — they can only sell their life estate. Nobody's buying a house they'll get kicked out of when you die.",
    traps: [
      "Life Estate 可以出租吗？可以，但租约不能超过 life tenant 的寿命。life tenant 一死，租约自动终止，remainderman 不受约束。",
      "Waste 原则：life tenant 有义务维持财产价值。砍掉所有大树卖木材？那是 'voluntary waste'，remainderman 可以告你。",
      "Pur Autre Vie：以第三人的寿命为衡量标准的 life estate，不是以 you 的寿命。这口井很深，考试爱考。",
      "Fee Simple 并非真的 '绝对' — 政府仍然可以通过 eminent domain、police power（zoning）、taxation 限制你。",
      "Life Estate + 售卖权 combo：有些 life estate 同时赋予了 life tenant 销售权，但售卖所得归 life tenant 享有 life estate 期间的收益，本金归 remainderman。超极复杂，但考试偶尔出现。"
    ]
  },
  {
    id: "art02",
    category: "agency",
    title: "Fiduciary Duties Decoded: Your 6-Pack of Legal Obligations as a Broker",
    official: "Under agency law, a real estate broker acting as a fiduciary owes their principal six core duties: Obedience, Loyalty, Disclosure, Confidentiality, Accountability, and Reasonable Care — commonly remembered by the acronym OLD CAR.",
    layman: "客户是爷，你是孙子。这六个职责是你的卖身契：Obedience (听客户的合法指令), Loyalty (客户利益高于你的佣金), Disclosure (别藏任何事，连苍蝇腿的事都得说), Confidentiality (客户的秘密跟你进坟墓), Accountability (客户的钱不是你的钱，一分都不能动), Reasonable Care (别当猪队友，该检查的检查该建议的建议)。考试必考：OLD CAR 永远适用，哪怕客户提了奇葩要求。但注意：你不需要服从非法指令 — 忠诚不等于帮客户违法。",
    traps: [
      "保密义务没有过期日！交易结束后，你依然不能泄露客户的财务信息。除非法院传票或客户书面同意。",
      "Disclosure vs. Confidentiality 的冲突：如果客户告诉你房子有白蚁但你签了保密协议怎么办？答案是 disclosure 义务优先 — 法律和伦理要求你披露 material facts，保密协议不能覆盖欺诈。",
      "Dual Agency 怪圈：同一个 broker 代表买卖双方？那 OLD CAR 怎么执行？答案是大多数州要求 written consent，并且 broker 必须转为 'limited consensual dual agency' — 不能帮任何一方谈判最优价格。",
      "Subagency 陷阱：如果你的经纪人介绍了一个买家，那个买家找了另一个 broker 合作 — 那个 broker 是你的 subagent 吗？传统上是，但现代 practice 已经几乎废除 subagency，改用 cooperative compensation。考试会考这个历史演变。",
      "Reasonable Care 的标准：不是完美无缺，而是 'same degree of care that a reasonably prudent real estate professional would exercise under similar circumstances.' 你不需要是房屋检测专家，但你该发现的东西没发现就是 negligence。"
    ]
  },
  {
    id: "art03",
    category: "contract",
    title: "Void vs. Voidable: One Letter Changes Everything in Contract Law",
    official: "A void contract is an agreement that never had legal effect from its inception due to a missing essential element. A voidable contract is a valid agreement that one party may choose to affirm or reject due to a defect such as incapacity, duress, or fraud.",
    layman: "Void = 从出生就死了，never a contract。Voidable = 活着但按了 'undue influence' 按钮可以随时取消。区别？一个根本没存在过，一个存在但可以被 kill。考试最爱问：minor 签的合同是 void 还是 voidable？答案是 voidable（minor 可以取消，但如果不取消就有效）。而 'contract to commit murder' 是 void（非法目的 = 根本无效）。划重点：void 是任何人都不能 enforce；voidable 是被害方可以 choose to enforce。",
    traps: [
      "Minor 签的合同是 voidable，不是 void！Minor 可以等成年后 ratify 这个合同，也可以 disaffirm。但如果 disaffirm 必须在成年后的合理时间内做出。",
      "Duress 造成的 voidable：暴力威胁（gun to head）= 物理 duress，导致 voidable。合约本身有效直到签署方声称取消。",
      "Fraud 导致的 voidable：被骗签的合同是 voidable，不是 void。被骗方可以选择继续履行（ratification）或取消（rescission）。",
      "Unenforceable 是第三个概念 — 合同本身 valid 但 courts won't enforce it（比如 statute of limitations 过了，或者违反了 Statute of Frauds 没书面形式）。不是 void 也不是 voidable，而是没人能告赢。",
      "Statute of Frauds 说 real estate contract 必须 in writing。口头房地产合同是 unenforceable，不是 void。如果双方都履行了，你也不能说合同不存在。"
    ]
  },
  {
    id: "art04",
    category: "finance",
    title: "PMI vs. MIP: Same Insurance, Different Alphabet Soup",
    official: "Private Mortgage Insurance (PMI) is insurance required by conventional lenders on loans with a down payment of less than 20%, protecting the lender against borrower default. Mortgage Insurance Premium (MIP) is the insurance required on FHA-insured loans, paid both upfront and annually, protecting the lender against loss.",
    layman: "两个都是你付钱保护银行的东西。PMI = 传统贷款（Conventional）如果 down payment <20%。MIP = FHA 贷款的保护费。区别是：PMI 到了 22% equity 就自动取消（你写信要求的话 20% 就能取消），而 MIP 基本跟着你 forever — 除非你 refinance 或还清。FHA 2024 之后如果你首付 ≥10%，MIP 会在 11 年后取消。首付 <10% 就一辈子跟着你。考试陷阱：PMI 可以在 borrower 要求下取消在 80% LTV，贷款方必须在 78% LTV 自动取消。MIP 不是。",
    traps: [
      "PMI 取消规则：borrower 请求取消在 80% LTV 就可以。Lender 必须在 78% LTV 自动取消（基于 original value）。但 FHA MIP 没有这个自动取消机制（除非首付 ≥10% 且过了 11 年）。",
      "Upfront MIP (UFMIP)：FHA 贷款除了年缴纳的 MIP，还有 upfront 的费用（目前是 1.75% of loan amount），可以 roll 进贷款里。PMI 没有 upfront fee。",
      "PMI tax deductible？曾经是可扣税的，但 2021 年后已过期。目前 PMI 不 tax deductible，除非国会重新立法（反复在变，考试不常考这个）。",
      "VA Loan 既没有 PMI 也没有 MIP！这是 VA 贷款的最大优势之一。有 VA funding fee，但可以 roll 进贷款，而且可以 zero down。",
      "Conventional 贷款低于 20% down 可以用：single premium（一次付清）+ monthly（每月付）+ lender-paid（利率高但不用付 PMI）。三种策略，考试会问各自的优劣。"
    ]
  },
  {
    id: "art05",
    category: "exam-tips",
    title: "Top 10 Exam Traps: What the Real Estate License Exam Loves to Trick You On",
    official: "The real estate licensing examination tests candidates on national principles of real property law, agency relationships, contracts, finance, valuation, and fair housing. Candidates frequently confuse paired concepts with subtle but critical distinctions.",
    layman: "考试就是挖坑专业户。十个必考陷阱：1) Accretion vs. Avulsion（慢 vs 快）；2) Appurtenant Easement vs. Easement in Gross（跟着地走 vs 跟着人走）；3) Actual Notice vs. Constructive Notice（有人告诉你 vs 你自己去查）；4) Joint Tenancy vs. Tenancy in Common（survivorship vs 继承）；5) Void vs. Voidable vs. Unenforceable（死了 vs 可以杀 vs 杀不动）；6) PMI vs. MIP（能取消 vs 不能）；7) General Warranty vs. Special Warranty（一辈子的保证 vs 只管自己那段时间）；8) Bilateral vs. Unilateral（两个许诺 vs 一个许诺一个行动）；9) Broker vs. Salesperson（degree of supervision 范围）；10) Puffing vs. Misrepresentation（吹牛合法 vs 骗人违法）。记不住这些区别？考试会教你做人。",
    traps: [
      "Accretion vs. Avulsion 关键词：'gradual and imperceptible' = accretion. 'Sudden and violent' = avulsion. 而且 avulsion 不会改变 property line！这是考前最爱问的 trick。",
      "Constructive Notice 靠 recording — 你 register 了 deed 就相当于通知了全世界。Actual Notice 是 physical possession — 你住在那里，所有人都知道你有 interests。Constructive 靠文件，actual 靠行动。",
      "Puffing 的底线：opinion（'best house ever'）是 puffing。Factual statements（'roof is brand new'）如果是假的 = misrepresentation。选线上：如果 reasonable person 不会 rely on it，大概率是 puffing。",
      "Broker vs. Salesperson：Salesperson 必须挂靠在 broker 名下，不能独立经营。Broker 可以独立办公、雇佣 salesperson、接收 commissions。两者都是 licensee，但 broker 有更高级别的 license。",
      "Appraisal 四种方法的比较：Sales Comparison（最常用，看 comps），Cost Approach（看重建成本），Income Approach（看 NOI / cap rate），Reconciliation（综合判断）。每一种都有适用场景，考试会给你 scenario 让你选方法。"
    ]
  },
  {
    id: "art06",
    category: "ownership",
    title: "Joint Tenancy vs. Tenancy in Common: No Survivors vs. Testators Welcome",
    official: "Joint tenancy is a form of co-ownership characterized by the right of survivorship and requiring equal shares with the four unities of time, title, interest, and possession. Tenancy in common is a form of co-ownership where co-owners hold undivided interests that can be unequal and are inheritable without survivorship rights.",
    layman: "Joint Tenancy = '最后一个站着的人把全部拿走'。你和三个人买房，你死了，你的份额自动分给其他三个人。你的遗嘱不管用，你的小孩拿不到，你的事后安排全部白费。Tenancy in Common = '各管各的，死了传给自己的继承人'。你拥有 40%，B 和 C 各 30%。你死了，你的 40% 去你的遗嘱指定的继承人，B 和 C 不管。考试最爱问：四个 unity（Time, Title, Interest, Possession）必须全部满足才能建立 Joint Tenancy。少一个就自动变成 Tenancy in Common。",
    traps: [
      "四统一原则 (Four Unities)：Time（所有人同时获得 Title）、Title（同一个 deed）、Interest（相等份额）、Possession（都有权占有）。缺一个 → Tenancy in Common。",
      "Joint Tenant 可以卖自己的份额吗？可以！但卖了之后，新买家就成了 Tenants in Common 而不是 Joint Tenants — 打破了四统一。考试必考这个突然变化。",
      "Severance of Joint Tenancy：如果一个 joint tenant 偷偷把份额卖给外人或者抵押了，joint tenancy 在那一部分就 sever 了，变成 Tenancy in Common。剩余的人 still joint tenants among themselves。",
      "Community Property with Right of Survivorship：有些西部州（CA, NV, AZ, WA, ID, WI, TX）有这个 hybrid form — 综合了 community property 的税务优势和 survivorship 的避免 probate 优势。",
      "Tenancy by the Entirety：只有 married couples 能用，creditors of only one spouse 拿不到财产。离婚后自动变成 Tenancy in Common。考试常混淆这个和 Joint Tenancy。"
    ]
  },
  {
    id: "art07",
    category: "contract",
    title: "Earnest Money, Liquidated Damages & Specific Performance: The Forfeiture Trinity",
    official: "Earnest money is a good-faith deposit made by a buyer to demonstrate serious intent. Liquidated damages are a pre-agreed monetary amount payable upon breach. Specific performance is an equitable court order compelling a party to perform their contractual obligations exactly as agreed.",
    layman: "Earnest Money = 你掏出保证金告诉卖家 '我是认真的不是来玩的'。Liquidated Damages = 合同里写的 '你违约了，这笔押金归我了'。Specific Performance = 法院说 '我不想听你的借口，过户必须完成'。正常情况：buyer 违约 → seller 扣 earnest money 作为 liquidated damages（通常在 1-3%）。buyer 如果想赖账逃跑，最多损失保证金。但如果 property 价值涨了 20%，seller 不需要 'specific performance'，因为 money damages 就够了 — 他们可以卖给别人。但是，如果 property 是 unique（historical landmark, 你爷爷的房子等），买方可以要求 specific performance 强制卖方过户。",
    traps: [
      "Liquidated Damages 必须是 reasonable estimate of actual damages。如果 earnest money 是 50% of purchase price，法院可能认定是 penalty（penalty 是无效的！），而不是 valid liquidated damages。",
      "卖家不能既要扣 earnest money 又要起诉 specific performance — 二选一。合同通常会写 earnest money 是 'sole remedy'（唯一救济）。但在 fraud 情况下可以同时追。",
      "Specific Performance 是 equitable remedy，不是 legal remedy。Equity 要求 'clean hands' — 如果你自己违约在先，你不能要求对方履行。",
      "Earnest Money 谁持有？不是 seller 也不是 listing broker — 是 escrow agent / title company。如果 broker 持有，必须放在 trust/escrow account 里 — 不能 commingle！",
      "Buyer 的 earnest money 利息归谁？看合同约定。大多数情况归 buyer，但有的州规定在特定金额以上必须付利息给 buyer。"
    ]
  },
  {
    id: "art08",
    category: "finance",
    title: "Amortization, Balloon Payments & Negative Amortization: Three Ways to Structure a Loan",
    official: "Fully amortized loans reduce principal to zero over the loan term through equal periodic payments. Partially amortized loans leave a remaining balance requiring a balloon payment. Negative amortization occurs when payments are less than the interest due, causing the principal balance to increase over time.",
    layman: "Fully Amortized 你懂：每个月还一样的钱，30 年后贷款归零。Partially Amortized = 你每月还一点，但不够还完，最后欠一大笔 'balloon payment'。Negative Amortization = 最骚的操作 — 你每个月还的钱连利息都不够！欠的利息加进本金里，所以你的贷款余额不降反升。2008 年次贷危机时很多人就是死在 negative amortization 上。考试最爱问：payment 低于 interest due → principal increases → negative amortization。这三个的概念你一定要分清。",
    traps: [
      "Balloon Payment 的两类 trigger：部分情况下是因为 payment 只 cover 了 interest（interest-only loan），完全没还 principal；部分情况下是因为 fully amortized over 30 years 但是 loan term 只有 15 years — term 到了 balloon 就来了。",
      "Negative Amortization 的 cap：大多数 negative amortization loan 有个 limit — 不能超过 original loan amount 的 110-125%。到了 cap 之后必须 recast（重算 payment）。",
      "Prepayment Penalty：某些 loan 如果提前还清（避免 balloon payment）是要罚款的。但 RESPA/TILA 对某些 loan 有限制。",
      "Fully Amortized Payment 计算公式：P = L[c(1 + c)^n] / [(1+c)^n - 1]。考试不考这个公式，但你得知道 fully amortized = level payment 且到期归零。",
      "Interest-Only Loan：前 N 年只付利息，不付本金。之后变成 fully amortized。这里容易和 negative amortization 混淆 — interest-only 是我付了利息但还是没脱本金（本金不变），negative amortization 是没付完利息导致本金增加了。"
    ]
  },
  {
    id: "art09",
    category: "exam-tips",
    title: "Back-of-the-Envelope Math: 6 Formulas That Guarantee 5 Free Points on Exam Day",
    official: "Real estate licensing exams include computational questions testing candidates' ability to calculate basic financial metrics including loan-to-value ratios, gross rent multipliers, discount points, capitalization rates, commission amounts, and property tax using millage rates.",
    layman: "六个公式搞定考试中的计算题：1) LTV = Loan / Value（贷款÷房价）。2) GRM = Price / Annual Rent（房价÷年租金）。3) Cap Rate = NOI / Value（净收入÷房价）。4) Commission = Price × Rate（房价×佣金率）。5) Discount Points = Points × Loan Amount（点数×贷款额），1 point = 1% of loan。6) Property Tax = Assessed Value × Mill Rate（评估值×千分率），注意 mill rate 是 per $1,000！考试最喜欢让你换转 mill rate — 30 mills 就是 3% — 先除以 1000。记不住这六个？考试会硬生生扣你 5 分。",
    traps: [
      "Mill Rate 陷阱：30 mills ≠ 30%！30 mills = 30 / 1000 = 0.03 = 3%。如果 assessed value 是 $200k，tax = $200,000 × 0.03 = $6,000。很多人错在直接 × 30。",
      "GRM vs. GIM：GRM 用月租金×12 = 年租金。GIM 用总经营收入（如果有 parking 等别的收入）。考试说 GRM 就用 residential rent × 12。",
      "Appreciation 计算：如果房子涨了 5%，不是 × 1.05 就是 ÷ 0.95？涨 5% 是 × 1.05。如果你想知道房子跌了 5% 后要涨多少才回到原点 — 那是 ÷ 0.95。两个不一样！",
      "Discount Points 的税务处理：borrower 付的 points 可以 itemized deduction。必须 amortized over the life of the loan。但如果 refinance，剩余未摊销的 points 可以当年全额扣。",
      "Proration 计算：关账时的税款分摊 — buyer 和 seller 各付自己拥有期间的地税。考试用 360 天（12×30），不要用 365！"
    ]
  }
];

// Export for browser
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { articlesDb };
}
