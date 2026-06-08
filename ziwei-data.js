// ZWDS Reading Data — 14 stars × 12 palaces
// This must be loaded BEFORE ziwei-results.html rendering code

const ZWDS_READINGS = {
  "紫微": {
    "cn": "紫微",
    "en": "Zi Wei · Purple Emperor",
    "nature": "Emperor",
    "readings": {
      "命宮": {
        "hook": "You carry the bearing of someone born to command — not through force, but through presence.",
        "body": "The Purple Star in your Life Palace bestows an innate authority that others recognize before you speak. You are meant to lead, whether you seek it or not. Your life path involves stepping into a position of influence that requires both dignity and the willingness to stand alone.",
        "year2026": "2026 activates your leadership cycle — expect a major role shift or recognition."
      },
      "兄弟宮": {
        "hook": "Your siblings see you as the standard they measure themselves against.",
        "body": "The Emperor Star here suggests a natural hierarchy among your peers — you are the one they look to, even if unspoken. Sibling relationships carry an element of duty and expectation.",
        "year2026": "Family dynamics shift this year; an old sibling rivalry may finally resolve."
      },
      "夫妻宮": {
        "hook": "You attract partners who recognize your depth but struggle to match your scale.",
        "body": "In matters of love, you need someone who respects your independence and doesn't compete for the throne. A partner who tries to control you will trigger your withdrawal instinct.",
        "year2026": "A significant relationship decision presents itself — clarity comes through honest conversation."
      },
      "子女宮": {
        "hook": "Your creative output bears the mark of royalty — you cannot produce anything mediocre.",
        "body": "Children or creative projects reflect your high standards. You invest deeply in what you create and expect significant returns, whether emotional or material.",
        "year2026": "A creative venture begun this year carries exceptional long-term potential."
      },
      "財帛宮": {
        "hook": "Money flows to you through positions of responsibility, not through chasing it directly.",
        "body": "Your wealth comes as a byproduct of leadership and authority. The more you focus on your使命, the more abundance follows. You are not suited for speculative ventures.",
        "year2026": "A financial opportunity tied to your reputation arrives mid-year — evaluate carefully."
      },
      "疾厄宮": {
        "hook": "Your body responds to how much weight you carry — literal and figurative.",
        "body": "Stress manifests in your cardiovascular and nervous systems. You need regular decompression from leadership pressures. Moderate exercise, not intensity, suits your constitution.",
        "year2026": "Pay attention to sleep quality — it's your primary health indicator this year."
      },
      "遷移宮": {
        "hook": "You carry your kingdom with you — every place you go becomes your domain.",
        "body": "Travel and relocation favor you. You adapt quickly and often find opportunities when away from home base. Foreign cultures respect your natural authority.",
        "year2026": "An overseas trip or relocation possibility opens unexpected doors."
      },
      "交友宮": {
        "hook": "You attract loyal subordinates but struggle with equals.",
        "body": "Those who work under you are fiercely loyal. Peers, however, may feel threatened by your presence. Learn to manage sideways relationships with careful diplomacy.",
        "year2026": "A key subordinate reveals their true potential — delegate more."
      },
      "官祿宮": {
        "hook": "Your career is not a job — it is a dynasty in the making.",
        "body": "Professional success is almost guaranteed with the Emperor in your Career Palace. The question is not whether you will succeed, but what you will build that outlasts you.",
        "year2026": "Promotion or major career expansion is highly likely this year."
      },
      "田宅宮": {
        "hook": "Your home must reflect your stature — a palace befitting an emperor.",
        "body": "Real estate and property are important to your sense of stability. You invest in homes that make a statement. Ancestral property may play a significant role in your life.",
        "year2026": "A property transaction closes favorably — trust your instincts on timing."
      },
      "福德宮": {
        "hook": "Your inner world is a throne room — few are invited, and fewer understand it.",
        "body": "Spiritually, you are drawn to systems that recognize hierarchy and cosmic order. Meditation on the classical texts of any tradition resonates with you.",
        "year2026": "A spiritual insight this year redefines what success means to you."
      },
      "父母宮": {
        "hook": "Your relationship with authority began with your parents — and it shaped everything.",
        "body": "Parental expectations were high, possibly leaving you with a sense of never quite being enough. Healing this pattern unlocks your full leadership potential.",
        "year2026": "Reconciliation with a parent or mentor brings emotional closure."
      }
    }
  },
  "天機": {
    "cn": "天機",
    "en": "Tian Ji · Heavenly Strategist",
    "nature": "Advisor",
    "readings": {
      "命宮": {
        "hook": "Your mind moves in patterns others cannot see — you are a strategist by nature, not by choice.",
        "body": "Tian Ji in the Life Palace makes you exceptionally analytical, but prone to overthinking. You see connections and consequences that others miss. Your life's work involves using this intelligence wisely — not as a weapon against yourself.",
        "year2026": "A strategic decision you make in spring will ripple for years — choose wisely."
      },
      "兄弟宮": {
        "hook": "Your siblings are your first chess opponents — and your most honest critics.",
        "body": "Mental sparring with peers sharpens your intellect. You may have grown up in an environment where wit was valued, and you learned to think three moves ahead.",
        "year2026": "A sibling or close peer offers advice that changes your trajectory."
      },
      "夫妻宮": {
        "hook": "You need a partner who can match your mental speed — boredom is your relationship killer.",
        "body": "Intellectual stimulation is non-negotiable in romance. You are drawn to people who challenge your thinking. Emotional expression comes through shared ideas.",
        "year2026": "A relationship deepens through intellectual collaboration this year."
      },
      "子女宮": {
        "hook": "Your children inherit your restless intellect — they will question everything.",
        "body": "Creative projects require intellectual depth. You may find yourself mentoring or teaching. Your legacy is one of ideas passed to the next generation.",
        "year2026": "A creative idea you've been incubating is ready to execute."
      },
      "財帛宮": {
        "hook": "Your wealth comes through your mind — consulting, analysis, strategy.",
        "body": "Money follows your intellectual output. You are well-suited for roles that require research, planning, or advisory work. Avoid get-rich-quick schemes — your wealth builds slowly but surely.",
        "year2026": "A strategic financial move pays off by year-end."
      },
      "疾厄宮": {
        "hook": "Your body absorbs your mental stress — anxiety lives in your digestion.",
        "body": "Overthinking manifests physically, especially in your digestive system. You need practices that quiet the mind — meditation, not more analysis. Headaches are your warning signal.",
        "year2026": "A shift in your health routine dramatically improves your energy."
      },
      "遷移宮": {
        "hook": "Travel expands your mental frameworks — you return from every trip changed.",
        "body": "You gain clarity when you change environments. International or cross-cultural experiences are particularly enriching. You think best when moving.",
        "year2026": "A journey this year brings unexpected intellectual breakthroughs."
      },
      "交友宮": {
        "hook": "You attract brilliant minds — managing them requires intellectual humility.",
        "body": "Your subordinates are sharp and independent. They respect competence, not hierarchy. Lead through ideas, not authority.",
        "year2026": "A talented collaborator joins your team — give them autonomy."
      },
      "官祿宮": {
        "hook": "Your career is defined by how well you think — not how hard you work.",
        "body": "You excel in roles that value strategy over execution. Consulting, research, technology, and academia suit you. Your reputation grows through the quality of your ideas.",
        "year2026": "A professional opportunity requiring deep analysis presents itself."
      },
      "田宅宮": {
        "hook": "Your home is your thinking space — clutter there means clutter in your mind.",
        "body": "You need a well-organized living environment. Property decisions require extensive research. You may move multiple times in life, each time refining your environment.",
        "year2026": "Consider reorganizing your living space for better productivity."
      },
      "福德宮": {
        "hook": "Your spiritual path is one of understanding — you seek to comprehend the cosmos intellectually.",
        "body": "You approach spirituality through study and pattern recognition. Systems like the I Ching or Buddhist philosophy appeal to your analytical nature.",
        "year2026": "A spiritual study or practice you begin now deepens unexpectedly."
      },
      "父母宮": {
        "hook": "Your parents valued your intelligence — perhaps too much.",
        "body": "You were likely praised for being smart, which created pressure to always have the answers. Healing means learning that you don't need to know everything.",
        "year2026": "Understanding your parents' own struggles brings emotional release."
      }
    }
  },
  "太陽": {
    "cn": "太陽",
    "en": "Tai Yang · The Sun",
    "nature": "Illuminator",
    "readings": {
      "命宮": {
        "hook": "You light up every room you enter — but who lights up yours?",
        "body": "The Sun in your Life Palace makes you naturally warm, generous, and visible. You are meant to be seen. Your life path involves bringing light to others, but you must guard against burning out from giving too much without receiving.",
        "year2026": "Your visibility peaks this year — step into the spotlight."
      },
      "兄弟宮": {
        "hook": "You are the sun among your siblings — they orbit around your warmth.",
        "body": "Your presence energizes family gatherings. Siblings look to you for support and guidance. You may carry more than your share of family responsibility.",
        "year2026": "A sibling needs your support — your warmth makes the difference."
      },
      "夫妻宮": {
        "hook": "You shine brightest when your partner appreciates your light.",
        "body": "In romance, you need someone who celebrates your radiance without being eclipsed by it. A partner who dims your shine is not for you.",
        "year2026": "Love comes when you stop hiding your brightness to make others comfortable."
      },
      "子女宮": {
        "hook": "Your children absorb your best qualities — radiance, generosity, warmth.",
        "body": "Creative projects thrive under your optimistic energy. You are a natural teacher and mentor. Your legacy is one of illumination.",
        "year2026": "A creative endeavor you nurture this year blossoms beautifully."
      },
      "財帛宮": {
        "hook": "Your wealth grows through visibility — the more people see you, the more you earn.",
        "body": "Careers in public-facing roles suit you. Your earning potential is tied to your reputation and network. Money follows your warmth and generosity.",
        "year2026": "A public-facing opportunity significantly boosts your income."
      },
      "疾厄宮": {
        "hook": "Your heart is both your greatest gift and your vulnerability.",
        "body": "The Sun governs the heart and circulation. You are prone to heat-related imbalances. Guard against overexertion and burnout. Your health improves when you balance giving with receiving.",
        "year2026": "Heart health deserves attention — both physical and emotional."
      },
      "遷移宮": {
        "hook": "The world welcomes you — you are a citizen of everywhere.",
        "body": "Travel suits you exceptionally well. You make friends wherever you go. International opportunities favor you. Your warmth translates across cultures.",
        "year2026": "An international trip brings both joy and opportunity."
      },
      "交友宮": {
        "hook": "You attract people who bask in your light — some are genuine, some are moths.",
        "body": "Your warmth draws many to you. Discern between those who appreciate you and those who simply want your energy. Lead with both generosity and boundaries.",
        "year2026": "A team member reveals their true colors — trust your discernment."
      },
      "官祿宮": {
        "hook": "Your career path requires visibility — you cannot succeed in obscurity.",
        "body": "You are meant for roles where your presence is felt. Leadership, public speaking, entertainment, teaching — any field where you shine. Your reputation is your currency.",
        "year2026": "Career advancement comes through a visible achievement."
      },
      "田宅宮": {
        "hook": "Your home should be filled with light — literally and energetically.",
        "body": "South-facing homes suit you. Your living space should feel open and welcoming. Property investments in warm, sunny locations favor you.",
        "year2026": "Consider a home renovation that brings in more natural light."
      },
      "福德宮": {
        "hook": "Your spirit craves light — you find the divine in warmth, generosity, and joy.",
        "body": "Spiritually, you are drawn to traditions that celebrate life and light. Your inner joy is genuine when you are connected to your purpose of serving others.",
        "year2026": "A spiritual practice involving light or fire resonates deeply."
      },
      "父母宮": {
        "hook": "Your parents were likely warm, generous people — or you learned warmth despite them.",
        "body": "Parental influence shaped your generous nature. If your upbringing was warm, you carry that forward. If not, you became the sun you needed.",
        "year2026": "Healing your relationship with a parent brings emotional freedom."
      }
    }
  },
  "武曲": {
    "cn": "武曲",
    "en": "Wu Qu · Military Melody",
    "nature": "Commander",
    "readings": {
      "命宮": {
        "hook": "You are forged from discipline — softness was never an option.",
        "body": "Wu Qu in your Life Palace makes you decisive, practical, and relentlessly capable. You are a natural executor. Your life path involves mastering a skill or craft through sheer discipline.",
        "year2026": "Your discipline pays off — a long-term goal materializes."
      },
      "兄弟宮": {
        "hook": "Your siblings respect your strength but may fear your directness.",
        "body": "Family relationships are straightforward with Wu Qu here. You value honesty over harmony. Siblings know where they stand with you.",
        "year2026": "A direct conversation with a sibling clears years of misunderstanding."
      },
      "夫妻宮": {
        "hook": "You need a partner who is your equal — not someone who needs rescuing.",
        "body": "In love, you seek strength and capability. You are not patient with emotional games. Your ideal partner is independent and respects your need for autonomy.",
        "year2026": "A relationship built on mutual respect deepens this year."
      },
      "子女宮": {
        "hook": "You raise your children to be capable — perhaps too capable for their age.",
        "body": "Your parenting or creative style is structured and goal-oriented. You teach discipline by example. Your legacy is one of competence passed on.",
        "year2026": "A younger person learns from your example — mentorship matters."
      },
      "財帛宮": {
        "hook": "Money comes through skill, discipline, and decisive action.",
        "body": "Your wealth is earned, not gifted. You excel in finance, engineering, military, or any field requiring precision. You are a natural saver and investor.",
        "year2026": "A financial decision you make with cold logic proves brilliant."
      },
      "疾厄宮": {
        "hook": "Your body is a machine — treat it with the respect it deserves.",
        "body": "Wu Qu governs the lungs and respiratory system. You are prone to pushing through illness. Your health requires structured routines, not heroics.",
        "year2026": "A disciplined health regimen transforms your vitality."
      },
      "遷移宮": {
        "hook": "You travel with purpose — every journey has a mission.",
        "body": "Travel for you is functional, not recreational. You move when there is something to accomplish. Your decisiveness serves you well in unfamiliar environments.",
        "year2026": "A business trip yields significant results."
      },
      "交友宮": {
        "hook": "You lead by example — your team follows because you deliver.",
        "body": "Subordinates respect your competence and directness. You have no patience for incompetence. Build teams of capable people and get out of their way.",
        "year2026": "A team restructuring improves efficiency dramatically."
      },
      "官祿宮": {
        "hook": "Your career is a campaign — every position is a battlefield won.",
        "body": "You are built for careers in finance, military, engineering, or entrepreneurship. Your professional path is one of steady advancement through merit.",
        "year2026": "A career milestone achieved through competence, not politics."
      },
      "田宅宮": {
        "hook": "Your home is your fortress — functional, secure, and built to last.",
        "body": "You value property that is practical and well-constructed. You are not interested in showy real estate. A home with good bones and solid structure appeals to you.",
        "year2026": "A real estate decision based on fundamentals, not trends, succeeds."
      },
      "福德宮": {
        "hook": "Your spirituality is practical — you find the sacred in discipline and service.",
        "body": "You are not drawn to abstract mysticism. Your spiritual practice involves doing good, serving others, and mastering yourself. The martial arts or disciplined meditation suit you.",
        "year2026": "A discipline-based spiritual practice brings unexpected peace."
      },
      "父母宮": {
        "hook": "Your parents taught you strength — perhaps at the expense of softness.",
        "body": "Parental influence was likely strict and discipline-oriented. You learned to be capable early. Healing involves letting yourself be vulnerable.",
        "year2026": "Understanding your parents' sacrifices brings emotional resolution."
      }
    }
  },
  "天同": {
    "cn": "天同",
    "en": "Tian Tong · Heavenly Union",
    "nature": "Peacemaker",
    "readings": {
      "命宮": {
        "hook": "You were born with an old soul and a young heart — harmony is your native language.",
        "body": "Tian Tong in the Life Palace makes you naturally gentle, diplomatic, and emotionally intelligent. You avoid conflict but understand human nature deeply. Your life path involves creating peace in places of tension.",
        "year2026": "Step out of your comfort zone — growth lives beyond harmony."
      },
      "兄弟宮": {
        "hook": "You are the peacemaker in your family — everyone comes to you.",
        "body": "Siblings trust your judgment and seek your counsel. You may have played the role of mediator growing up. Your presence calms family tensions.",
        "year2026": "A family gathering brings unexpected reconciliation."
      },
      "夫妻宮": {
        "hook": "You attract partners who feel safe with you — but safety is not enough.",
        "body": "In love, you create a peaceful environment. Your challenge is expressing needs that might disrupt harmony. True intimacy requires occasional discomfort.",
        "year2026": "A relationship deepens when you express what you truly need."
      },
      "子女宮": {
        "hook": "Your children inherit your gentleness — they are sensitive souls.",
        "body": "Creative projects flow with ease when you are relaxed. Your best work comes from a place of inner peace, not pressure. Creativity thrives in calm.",
        "year2026": "A creative project completed with ease surprises you with its quality."
      },
      "財帛宮": {
        "hook": "Wealth comes through service — you earn by making life better for others.",
        "body": "Your earning path involves helping, healing, or harmonizing. Careers in counseling, healthcare, hospitality, or the arts suit you. Money follows genuine service.",
        "year2026": "A service-oriented venture becomes surprisingly profitable."
      },
      "疾厄宮": {
        "hook": "Your body mirrors your emotional state — peace in, peace out.",
        "body": "Your health is directly tied to your emotional wellbeing. Stress manifests as digestive issues or skin problems. You thrive with a calm environment.",
        "year2026": "An emotional release improves a chronic health issue."
      },
      "遷移宮": {
        "hook": "You find peace wherever you go — you carry your harmony with you.",
        "body": "Travel is restorative for you. You adapt easily to new environments. The journey matters more than the destination for you.",
        "year2026": "A peaceful retreat brings clarity on a major life decision."
      },
      "交友宮": {
        "hook": "You attract gentle souls — your team reflects your harmonious nature.",
        "body": "Colleagues and subordinates appreciate your kind leadership. You create a supportive work environment. Your challenge is addressing performance issues directly.",
        "year2026": "A difficult conversation with a team member leads to better understanding."
      },
      "官祿宮": {
        "hook": "Your career path involves bringing people together.",
        "body": "You excel in HR, counseling, diplomacy, education, or the arts. Your professional success comes through your ability to create harmony in any environment.",
        "year2026": "Career growth comes through a collaborative project."
      },
      "田宅宮": {
        "hook": "Your home is your sanctuary — it should feel like a peaceful retreat.",
        "body": "A calm, aesthetically pleasing home is essential for your wellbeing. You are drawn to spaces with natural elements and soft colors.",
        "year2026": "Create a peaceful corner in your home dedicated to quiet reflection."
      },
      "福德宮": {
        "hook": "Your spiritual path is one of inner peace — you find the divine in quiet moments.",
        "body": "You are naturally drawn to meditative practices. Your inner world is rich with compassion. The Taoist concept of effortless action resonates with you.",
        "year2026": "A meditation or mindfulness practice deepens your spiritual life."
      },
      "父母宮": {
        "hook": "Your parents likely valued harmony — perhaps at the expense of direct communication.",
        "body": "Your upbringing taught you to keep the peace, possibly suppressing your own needs. Healing involves learning that conflict can be productive.",
        "year2026": "A conversation with parents about unspoken matters brings relief."
      }
    }
  },
  "廉貞": {
    "cn": "廉貞",
    "en": "Lian Zhen · Chaste Honor",
    "nature": "Strategist",
    "readings": {
      "命宮": {
        "hook": "You see through every mask — deception is impossible around you.",
        "body": "Lian Zhen in the Life Palace makes you intensely perceptive about human nature. You combine intellect with intuition in a way that unsettles those with hidden agendas. Your life path involves wielding this power with integrity.",
        "year2026": "Use your discernment wisely — truth is your weapon and your shield."
      },
      "兄弟宮": {
        "hook": "You see your siblings more clearly than they see themselves.",
        "body": "Family dynamics are transparent to you. You understand the hidden motivations driving sibling behavior. Use this insight with compassion, not judgment.",
        "year2026": "A family truth you've always sensed surfaces — how you handle it matters."
      },
      "夫妻宮": {
        "hook": "You need a partner you cannot fully figure out — mystery keeps you engaged.",
        "body": "In romance, you are drawn to depth and complexity. You need someone with layers. A partner who is too simple bores you. Trust is your biggest challenge.",
        "year2026": "A relationship requires a leap of faith — logic alone won't decide this."
      },
      "子女宮": {
        "hook": "Your children inherit your penetrating insight — they see through everything.",
        "body": "Creative work for you must have depth and meaning. Surface-level projects do not satisfy. Your legacy is one of truth-telling through your craft.",
        "year2026": "A creative project with moral depth gains unexpected attention."
      },
      "財帛宮": {
        "hook": "Your wealth comes through strategic thinking and careful risk assessment.",
        "body": "You excel in roles that require both intellect and integrity — law, investigation, strategy, or leadership. Your financial instincts are sharp, but you must avoid the temptation of shortcuts.",
        "year2026": "A strategic financial move made with integrity pays off."
      },
      "疾厄宮": {
        "hook": "Your intensity burns from within — your body needs periodic reset.",
        "body": "Lian Zhen can create internal heat and tension. You are prone to stress-related inflammation. Regular detoxification and cooling practices benefit you.",
        "year2026": "A health scare proves to be a wake-up call — listen to it."
      },
      "遷移宮": {
        "hook": "You see foreign cultures with rare depth — nothing escapes your observation.",
        "body": "Travel is intellectually rich for you. You understand the undercurrents of every place you visit. Cross-cultural work suits your perceptive nature.",
        "year2026": "An international experience changes your perspective profoundly."
      },
      "交友宮": {
        "hook": "You attract complex people — and you see right through them.",
        "body": "Your team members know they cannot hide from your perception. This makes you an effective leader but can feel intimidating. Balance truth with tact.",
        "year2026": "A subordinate's hidden talent comes to light through your observation."
      },
      "官祿宮": {
        "hook": "Your career demands integrity — your reputation is your most valuable asset.",
        "body": "You excel in law, investigation, academia, strategy, or leadership roles where integrity matters. Your professional path is one of principled action.",
        "year2026": "A career decision tests your values — stay true to them."
      },
      "田宅宮": {
        "hook": "Your home must have depth — a superficial space makes you restless.",
        "body": "You need a home with character and history. Modern minimalism may feel sterile to you. Antiques, art, and well-chosen objects ground you.",
        "year2026": "A home with history becomes available — consider it seriously."
      },
      "福德宮": {
        "hook": "Your spiritual path is one of truth — you seek to see reality as it is.",
        "body": "You are drawn to spiritual traditions that value direct perception over blind faith. Zen, Taoist philosophy, or the mystics of any tradition appeal to you.",
        "year2026": "A spiritual insight about human nature transforms your worldview."
      },
      "父母宮": {
        "hook": "Your relationship with your parents shaped your relationship with truth.",
        "body": "Parental honesty or lack thereof deeply affected you. You learned to read between the lines early. Healing involves trusting that the truth can coexist with love.",
        "year2026": "An honest conversation with a parent about the past brings healing."
      }
    }
  },
  "天府": {
    "cn": "天府",
    "en": "Tian Fu · Celestial Treasury",
    "nature": "Treasurer",
    "readings": {
      "命宮": {
        "hook": "You are built to steward abundance — prosperity follows you like gravity.",
        "body": "Tian Fu in the Life Palace makes you naturally prosperous, stable, and wise with resources. You attract wealth and know how to preserve it. Your life path involves building enduring structures — financial, familial, or institutional.",
        "year2026": "A resource management decision sets you up for years of stability."
      },
      "兄弟宮": {
        "hook": "Your family is your foundation — and you are theirs.",
        "body": "Siblings rely on you for stability and support. You play the role of the rock in your family. Material generosity comes naturally to you with loved ones.",
        "year2026": "A family financial matter resolves through your steady guidance."
      },
      "夫妻宮": {
        "hook": "You seek a partner who values stability as much as you do.",
        "body": "In love, you are drawn to dependable, grounded people. Flashy romance does not impress you. You build love slowly, like a treasury — one brick at a time.",
        "year2026": "A relationship built on shared values becomes your greatest asset."
      },
      "子女宮": {
        "hook": "Your children inherit your sense of value — they know what matters.",
        "body": "You raise your children to appreciate quality over quantity. Creative projects for you must have enduring worth. Your legacy is built to last.",
        "year2026": "An investment in a younger person's future yields returns beyond money."
      },
      "財帛宮": {
        "hook": "Your wealth is not luck — it is the natural result of wise stewardship.",
        "body": "Money management comes naturally to you. You are skilled at preserving and growing resources. Real estate, investments, and conservative financial strategies suit you.",
        "year2026": "A conservative financial decision outperforms risky alternatives."
      },
      "疾厄宮": {
        "hook": "Your body is your primary treasury — guard it with the same care as your wealth.",
        "body": "You tend to accumulate — including in your body. Watch for issues related to metabolism and digestion. Moderate eating and regular movement are essential.",
        "year2026": "A dietary adjustment improves your energy and longevity."
      },
      "遷移宮": {
        "hook": "You travel with purpose — every journey has a destination and a return.",
        "body": "You travel to acquire — experiences, knowledge, or connections. You appreciate quality accommodations and well-planned itineraries. Spontaneity is not your style.",
        "year2026": "A well-planned trip yields valuable connections and insights."
      },
      "交友宮": {
        "hook": "You attract capable people who appreciate your steady leadership.",
        "body": "Your team is loyal because you provide stability and fair compensation. You create environments where people can grow. Your generosity with resources builds loyalty.",
        "year2026": "Rewarding your team's loyalty pays dividends in unexpected ways."
      },
      "官祿宮": {
        "hook": "Your career is about building something that lasts.",
        "body": "You excel in finance, real estate, management, or any field involving stewardship of resources. Your professional legacy is one of stability and growth.",
        "year2026": "A career move into a stable, established organization suits you well."
      },
      "田宅宮": {
        "hook": "Your home is your castle — literally and energetically.",
        "body": "Property is deeply important to you. You invest in homes with good bones and long-term value. Your living space reflects your prosperity and taste.",
        "year2026": "A property investment made this year will appreciate significantly."
      },
      "福德宮": {
        "hook": "Your spiritual abundance matches your material abundance.",
        "body": "You find peace in nature, quality art, and meaningful traditions. Your inner life is as rich as your outer life. Gratitude is your natural spiritual practice.",
        "year2026": "A spiritual practice involving gratitude amplifies your abundance."
      },
      "父母宮": {
        "hook": "Your parents taught you about value — what was truly worth keeping.",
        "body": "Your upbringing taught you discernment about people and resources. Parental influence shaped your understanding of what endures.",
        "year2026": "An inheritance — material or spiritual — arrives from a parent or mentor."
      }
    }
  },
  "太陰": {
    "cn": "太陰",
    "en": "Tai Yin · The Moon",
    "nature": "Empath",
    "readings": {
      "命宮": {
        "hook": "You feel everything — the joy and the sorrow of everyone around you.",
        "body": "Tai Yin in the Life Palace makes you deeply sensitive, intuitive, and emotionally attuned. You perceive the emotional undercurrents of any room. Your life path involves learning to protect your energy while still being of service.",
        "year2026": "Set emotional boundaries this year — your sensitivity needs protection."
      },
      "兄弟宮": {
        "hook": "You absorb your siblings' emotions — sometimes before they do.",
        "body": "Family emotional dynamics affect you profoundly. You may have been the one who held the family's emotional weight. Learning to separate your feelings from theirs is essential.",
        "year2026": "A sibling's emotional breakthrough helps you understand your own patterns."
      },
      "夫妻宮": {
        "hook": "You need a partner who understands silence — not every feeling needs words.",
        "body": "In romance, emotional depth is everything. You are drawn to sensitive, artistic souls. Your ideal partner respects your need for quiet and understands your moods without explanation.",
        "year2026": "A relationship deepens through shared silence and presence."
      },
      "子女宮": {
        "hook": "Your children inherit your emotional depth — they are old souls in young bodies.",
        "body": "Creative work flows from your emotional state. Your best art comes from feeling deeply. Your legacy is one of emotional truth expressed through your craft.",
        "year2026": "A creative project born from deep feeling resonates with many."
      },
      "財帛宮": {
        "hook": "Your wealth flows through emotional intelligence — understanding people is your currency.",
        "body": "Careers involving counseling, art, real estate (especially homes), or any field requiring emotional insight suit you. Your earning potential is tied to your ability to connect.",
        "year2026": "An emotionally intelligent financial decision proves brilliant."
      },
      "疾厄宮": {
        "hook": "Your body holds your unprocessed emotions — release them or they manifest as illness.",
        "body": "Tai Yin affects the water element — your kidneys and bladder. Emotional holding leads to physical stagnation. Movement, tears, and creative expression are your medicine.",
        "year2026": "An emotional release improves a long-standing health issue."
      },
      "遷移宮": {
        "hook": "You find yourself drawn to watery places — oceans, lakes, rivers heal you.",
        "body": "Travel to water-rich environments restores your spirit. You are deeply connected to the moon and tides. Night travel suits your nature.",
        "year2026": "A trip to a coastal or lakeside destination changes your perspective."
      },
      "交友宮": {
        "hook": "You attract emotionally perceptive people — your team feels as much as they do.",
        "body": "Colleagues appreciate your empathy but may rely on it too much. You need emotional boundaries at work. Lead with both heart and structure.",
        "year2026": "A team member's emotional needs require your attention — handle with care."
      },
      "官祿宮": {
        "hook": "Your career path involves emotional depth — you cannot succeed in a soulless role.",
        "body": "You excel in counseling, art, real estate, or any field requiring emotional intelligence. Your professional fulfillment depends on meaningful connection.",
        "year2026": "A career move toward more meaningful work is the right choice."
      },
      "田宅宮": {
        "hook": "Your home is your emotional sanctuary — it must feel safe and soft.",
        "body": "You need a home that nurtures your sensitive nature. Soft lighting, water features, and cozy spaces are essential. Property near water calls to you.",
        "year2026": "Creating a more nurturing home environment transforms your wellbeing."
      },
      "福德宮": {
        "hook": "Your spirit speaks through emotion — you find the divine in feeling.",
        "body": "Your spiritual path is one of devotion and emotional connection. You are drawn to moon goddesses, feminine divine traditions, and practices that honor intuition.",
        "year2026": "A spiritual practice involving water or the moon deepens your connection."
      },
      "父母宮": {
        "hook": "Your mother or maternal figure shaped your emotional world profoundly.",
        "body": "Your relationship with your mother or primary caregiver defined how you relate to emotions. Healing this primary bond unlocks your emotional freedom.",
        "year2026": "Understanding your mother's own story brings compassion and closure."
      }
    }
  },
  "貪狼": {
    "cn": "貪狼",
    "en": "Tan Lang · Greedy Wolf",
    "nature": "Charmer",
    "readings": {
      "命宮": {
        "hook": "You were born with magnetic charm — people either love you or fear your power.",
        "body": "Tan Lang in the Life Palace makes you charismatic, multi-talented, and driven. You are drawn to pleasure, beauty, and power. Your life path involves mastering desire — transforming raw ambition into meaningful achievement.",
        "year2026": "Channel your ambition into one focused goal — scatter less, achieve more."
      },
      "兄弟宮": {
        "hook": "Your siblings admire your charm — and may compete with you.",
        "body": "Family dynamics with Tan Lang here involve both admiration and rivalry. You were likely the favorite or the most gifted. Sibling relationships require conscious generosity.",
        "year2026": "A sibling rivalry transforms into mutual respect this year."
      },
      "夫妻宮": {
        "hook": "You attract magnetic partners — chemistry is never the problem.",
        "body": "In love, you are drawn to beautiful, powerful, exciting people. Your challenge is sustaining interest after the chase. True love requires depth beyond chemistry.",
        "year2026": "A relationship that started as attraction deepens into something real."
      },
      "子女宮": {
        "hook": "Your children are born performers — they inherited your star quality.",
        "body": "Creative projects thrive on your bold energy. You are a natural entertainer and innovator. Your legacy is one of breaking molds and creating new norms.",
        "year2026": "A creative risk you take pays off in visibility and acclaim."
      },
      "財帛宮": {
        "hook": "Your wealth comes through charm, social connections, and multiple streams.",
        "body": "You are a natural entrepreneur and deal-maker. Your earnings often come from multiple sources. Your challenge is focus — you can make money anywhere if you commit.",
        "year2026": "A side venture becomes your primary income source."
      },
      "疾厄宮": {
        "hook": "Your body reflects your desires — indulgence shows quickly.",
        "body": "Tan Lang affects the reproductive system and liver. You are prone to overindulgence. Moderation in all things — especially food, drink, and pleasure — is your health key.",
        "year2026": "A health scare related to lifestyle choices becomes a turning point."
      },
      "遷移宮": {
        "hook": "The world is your playground — you make connections everywhere.",
        "body": "Travel is exciting and fruitful for you. You charm people wherever you go. International social networks expand rapidly for you.",
        "year2026": "A trip leads to a life-changing connection."
      },
      "交友宮": {
        "hint": "You attract ambitious people — managing their egos is your challenge.",
        "body": "Your team is talented but may have competing agendas. Your magnetism draws people to you, but loyalty must be earned, not assumed.",
        "year2026": "A talented team member needs recognition — give it generously."
      },
      "官祿宮": {
        "hint": "Your career is marked by reinvention — you succeed by adapting.",
        "body": "You excel in entertainment, entrepreneurship, sales, or any field requiring charm and adaptability. Your professional path involves multiple careers or reinventions.",
        "year2026": "A career pivot reveals your true calling."
      },
      "田宅宮": {
        "hint": "Your home reflects your taste — beautiful, social, and ever-changing.",
        "body": "You love a beautiful home that hosts gatherings. You may renovate or move frequently. Property near entertainment or nightlife appeals to you.",
        "year2026": "A home makeover or move brings renewed energy."
      },
      "福德宮": {
        "hint": "Your spiritual path involves transcending desire — not suppressing it.",
        "body": "Your spiritual journey is about transforming raw desire into higher purpose. You are drawn to traditions that integrate worldly life with spiritual practice.",
        "year2026": "A spiritual insight about desire brings unexpected liberation."
      },
      "父母宮": {
        "hint": "Your parents likely had strong personalities — you inherited their fire.",
        "body": "Your upbringing shaped your ambitious nature. Parental expectations may have been high. Your drive comes from wanting to prove yourself.",
        "year2026": "Understanding your parents' ambitions helps you understand your own."
      }
    }
  },
  "巨門": {
    "cn": "巨門",
    "en": "Ju Men · Mighty Gate",
    "nature": "Investigator",
    "readings": {
      "命宮": {
        "hook": "You speak the truth others avoid — and pay the price for it.",
        "body": "Ju Men in the Life Palace makes you honest, analytical, and outspoken. You have a gift for uncovering what is hidden. Your life path involves using your voice wisely — truth combined with tact is your greatest power.",
        "year2026": "Choose your words carefully — truth spoken with kindness lands differently."
      },
      "兄弟宮": {
        "hook": "Your siblings may have found you too blunt — honesty was not always welcome.",
        "body": "Family communication patterns were shaped by your directness. You may have been the truth-teller in the family. Learning when to speak and when to listen is your growth edge.",
        "year2026": "A difficult family conversation clears the air permanently."
      },
      "夫妻宮": {
        "hint": "You need a partner who can handle your honesty — no secrets allowed.",
        "body": "In love, transparency is everything. You cannot be with someone who hides things. Your ideal partner values radical honesty as much as you do.",
        "year2026": "A relationship deepens through complete honesty about a difficult topic."
      },
      "子女宮": {
        "hint": "Your children are naturally questioning — they will challenge everything you say.",
        "body": "Creative work for you involves research and investigation. You excel at uncovering truth through your craft. Your legacy is one of clarity and revelation.",
        "year2026": "A truth-seeking creative project gains traction."
      },
      "財帛宮": {
        "hint": "Your wealth comes through your voice and your mind.",
        "body": "Careers in law, journalism, research, consulting, or public speaking suit you. Your earning power is tied to your ability to communicate clearly and persuasively.",
        "year2026": "A speaking opportunity or publication significantly boosts your income."
      },
      "疾厄宮": {
        "hint": "Your throat and digestion reflect what you cannot say.",
        "body": "Ju Men governs the throat, mouth, and digestive system. Unexpressed truth manifests as throat issues or digestive problems. Speak your truth for health.",
        "year2026": "A health issue resolves when you finally express a withheld truth."
      },
      "遷移宮": {
        "hint": "Travel broadens your understanding — every culture teaches you something.",
        "body": "You travel to learn and investigate. Cross-cultural communication fascinates you. You are a natural interviewer and observer abroad.",
        "year2026": "An international experience reveals a truth about your own culture."
      },
      "交友宮": {
        "hint": "You attract people who value honesty — your team is refreshingly direct.",
        "body": "Colleagues appreciate your straightforwardness. You create an environment where truth is valued over politeness. Your challenge is delivering feedback with kindness.",
        "year2026": "A direct conversation with a colleague transforms your working relationship."
      },
      "官祿宮": {
        "hint": "Your career path involves communication — you are meant to be heard.",
        "body": "You excel in law, media, teaching, consulting, or any field where your voice carries weight. Your professional reputation is built on honesty.",
        "year2026": "A bold public statement defines your career this year."
      },
      "田宅宮": {
        "hint": "Your home should be a place where truth lives — no pretense allowed.",
        "body": "You need a home where you can be completely yourself. Artificial decor or keeping up appearances drains you. A comfortable, honest space is essential.",
        "year2026": "Decluttering your home of things that don't serve you brings mental clarity."
      },
      "福德宮": {
        "hint": "Your spiritual path is one of inquiry — you seek truth, not comfort.",
        "body": "You are drawn to philosophies that value questioning and direct experience. Zen, Socratic inquiry, or any tradition that encourages questioning appeals to you.",
        "year2026": "A spiritual question you've held for years finds its answer."
      },
      "父母宮": {
        "hint": "Your parents taught you to question everything — a gift and a burden.",
        "body": "Your upbringing valued intellectual honesty. You learned to challenge authority early. Healing involves learning that some things don't need to be dissected.",
        "year2026": "A parent's hidden truth surfaces — how you handle it defines your healing."
      }
    }
  },
  "天相": {
    "cn": "天相",
    "en": "Tian Xiang · Heavenly Minister",
    "nature": "Diplomat",
    "readings": {
      "命宮": {
        "hook": "You were born to bridge divides — diplomacy is your superpower.",
        "body": "Tian Xiang in the Life Palace makes you graceful, fair-minded, and socially intelligent. You see both sides of every argument. Your life path involves creating harmony in divided spaces and helping others find common ground.",
        "year2026": "Your mediation skills will be called upon — step up."
      },
      "兄弟宮": {
        "hint": "You are the family diplomat — everyone trusts your fairness.",
        "body": "Siblings come to you to resolve disputes. You play the role of peacemaker naturally. Your challenge is not taking sides when you have your own opinions.",
        "year2026": "A family dispute resolves through your fair mediation."
      },
      "夫妻宮": {
        "hint": "You need a partner who values harmony as much as you do — but not at all costs.",
        "body": "In love, you create a beautiful, balanced relationship. Your challenge is expressing your own needs when they might disrupt peace. True intimacy requires occasional productive conflict.",
        "year2026": "A relationship deepens when you express a need you've been suppressing."
      },
      "子女宮": {
        "hint": "Your children learn grace from watching you — they become natural diplomats.",
        "body": "Creative projects for you are collaborative and balanced. You excel in partnership work. Your legacy is one of bridge-building.",
        "year2026": "A collaborative creative project succeeds through your diplomatic touch."
      },
      "財帛宮": {
        "hint": "Your wealth comes through partnership and service.",
        "body": "Careers in law, diplomacy, HR, counseling, or service industries suit you. Your earning potential is tied to your ability to create win-win situations.",
        "year2026": "A partnership formed this year becomes financially fruitful."
      },
      "疾厄宮": {
        "hint": "Your health reflects how much you suppress to keep the peace.",
        "body": "Tian Xiang can lead to holding tension in the body. You swallow your feelings for harmony. This affects your throat, neck, and shoulders. Speak up for your health.",
        "year2026": "A physical symptom resolves when you stop accommodating others at your expense."
      },
      "遷移宮": {
        "hint": "You are a natural ambassador — you represent your culture well abroad.",
        "body": "International travel suits you. You adapt to different social norms with grace. Cross-cultural work or diplomacy is your calling.",
        "year2026": "An international role or assignment opens up for you."
      },
      "交友宮": {
        "hint": "You attract a harmonious team — your workplace feels like a community.",
        "body": "Colleagues appreciate your fairness and grace. You create a work environment where everyone feels heard. Your challenge is making tough decisions when consensus isn't possible.",
        "year2026": "A team conflict resolves through your diplomatic leadership."
      },
      "官祿宮": {
        "hint": "Your career path involves serving the greater good.",
        "body": "You excel in law, diplomacy, HR, nonprofits, or service-oriented businesses. Your professional success comes through your ability to help others find common ground.",
        "year2026": "A career opportunity in a bridge-building role is your path forward."
      },
      "田宅宮": {
        "hint": "Your home is a gathering place — friends and family feel welcome.",
        "body": "You need a home that can host others. Your living space is warm, balanced, and aesthetically pleasing. Property that facilitates community suits you.",
        "year2026": "Hosting a gathering at home leads to meaningful connections."
      },
      "福德宮": {
        "hint": "Your spiritual path is one of service — you find the divine in helping others.",
        "body": "You are drawn to traditions that emphasize compassion and service. The Bodhisattva ideal or any practice of selfless service resonates with your nature.",
        "year2026": "A service project deepens your spiritual life unexpectedly."
      },
      "父母宮": {
        "hint": "Your parents valued fairness — they taught you to see all sides.",
        "body": "Your upbringing emphasized justice and balance. You learned to mediate conflicts early. Healing involves recognizing that not every situation requires you to be neutral.",
        "year2026": "Understanding your parents' different perspectives brings you peace."
      }
    }
  },
  "天梁": {
    "cn": "天梁",
    "en": "Tian Liang · Heavenly Beam",
    "nature": "Protector",
    "readings": {
      "命宮": {
        "hook": "You were born to protect — your strength is in your steady kindness.",
        "body": "Tian Liang in the Life Palace makes you wise, nurturing, and protective. You are the elder soul among your peers. Your life path involves guiding and protecting those who come after you.",
        "year2026": "Your protective instincts will be tested — trust them, they are accurate."
      },
      "兄弟宮": {
        "hint": "You are the guardian of your siblings — they know you will always be there.",
        "body": "Family looks to you for protection and guidance. You may have taken on a parental role early. Your challenge is allowing siblings to make their own mistakes.",
        "year2026": "A sibling needs your protection — your steady presence makes all the difference."
      },
      "夫妻宮": {
        "hint": "You need a partner who lets you protect them — without becoming dependent.",
        "body": "In love, you are naturally nurturing. You are drawn to people who need your care. Your challenge is finding someone who allows your protection without losing their own strength.",
        "year2026": "A relationship shifts from caretaking to true partnership."
      },
      "子女宮": {
        "hint": "You are a natural mentor — your children learn wisdom from your example.",
        "body": "Creative work involves passing on knowledge. You are a natural teacher and guide. Your legacy lives in the people you have lifted up.",
        "year2026": "A mentoring relationship you invest in bears fruit."
      },
      "財帛宮": {
        "hint": "Your wealth comes through service and protection.",
        "body": "Careers in healthcare, education, social work, law, or elder care suit you. Your earning is tied to your ability to serve others. Money follows genuine care.",
        "year2026": "A service you provide becomes more valuable than expected."
      },
      "疾厄宮": {
        "hint": "Your body reflects your burden — you carry the weight of those you protect.",
        "body": "Tian Liang affects the stomach and spleen. You take on others' problems, which affects your digestion. Learning to hold others without absorbing their weight is essential.",
        "year2026": "Releasing someone else's burden improves your health dramatically."
      },
      "遷移宮": {
        "hint": "Travel connects you with those who need your protection.",
        "body": "You find purpose in helping others when away from home. Volunteer or service trips abroad suit you. Your protective nature translates across cultures.",
        "year2026": "A travel experience connects you with a community that needs your gifts."
      },
      "交友宮": {
        "hint": "You attract people who need your guidance — your team looks up to you.",
        "body": "Colleagues see you as a mentor. You naturally guide and protect your team. Your challenge is not creating dependency — empower others to stand on their own.",
        "year2026": "A team member you mentored achieves a breakthrough."
      },
      "官祿宮": {
        "hint": "Your career path is one of service and protection.",
        "body": "You excel in healthcare, education, law, counseling, or any field where you protect and guide others. Your professional fulfillment comes from making others safer.",
        "year2026": "A career move into a more service-oriented role is calling you."
      },
      "田宅宮": {
        "hint": "Your home is a shelter — others feel safe with you.",
        "body": "Your home provides a sense of safety for everyone who enters. You are drawn to homes that feel protective — solid construction, good location, safe neighborhood.",
        "year2026": "Your home becomes a refuge for someone in need."
      },
      "福德宮": {
        "hint": "Your spiritual path is one of compassion — you find the divine in protecting others.",
        "body": "You are drawn to spiritual traditions that emphasize compassion in action. The concept of the Bodhisattva or the Good Shepherd resonates deeply with you.",
        "year2026": "A compassionate act ripples further than you can see."
      },
      "父母宮": {
        "hint": "Your parents were your first protectors — they shaped your understanding of safety.",
        "body": "Your upbringing was likely nurturing and protective. If not, you became the protector you needed. Healing involves letting yourself be protected sometimes.",
        "year2026": "Allowing someone to protect you is a form of healing."
      }
    }
  },
  "七殺": {
    "cn": "七殺",
    "en": "Qi Sha · Seven Killings",
    "nature": "Warrior",
    "readings": {
      "命宮": {
        "hook": "You were born for battle — not against others, but against mediocrity.",
        "body": "Qi Sha in the Life Palace makes you fearless, driven, and relentless. You have an almost warrior-like approach to life. Your path involves channeling your intensity into meaningful conquests.",
        "year2026": "Choose your battles wisely — not every fight is yours."
      },
      "兄弟宮": {
        "hint": "Your siblings either admire your courage or compete with your intensity.",
        "body": "Family dynamics with Qi Sha are intense. You may have been the one who fought the family's battles. Learning to be soft with loved ones is your growth edge.",
        "year2026": "A sibling conflict requires you to lay down your armor."
      },
      "夫妻宮": {
        "hint": "You need a partner who can handle your fire — not be burned by it.",
        "body": "In love, you are intense and passionate. You need someone who matches your energy but grounds you. A partner who is afraid of your strength will not last.",
        "year2026": "A passionate relationship challenges you to be both strong and soft."
      },
      "子女宮": {
        "hint": "Your children inherit your warrior spirit — they are born fighters.",
        "body": "Creative work for you is intense and transformational. You disrupt industries and break molds. Your legacy is one of bold action.",
        "year2026": "A bold creative move defines your year."
      },
      "財帛宮": {
        "hint": "Your wealth comes through bold action — you earn by taking calculated risks.",
        "body": "You excel in competitive fields — entrepreneurship, military, sports, or high-stakes business. Your earning potential grows when you take decisive action.",
        "year2026": "A calculated risk you take this year pays off significantly."
      },
      "疾厄宮": {
        "hint": "Your body is built for intensity — but it also needs recovery.",
        "body": "Qi Sha affects the bones, teeth, and immune system. You push hard and need recovery periods. Structured rest is as important as structured effort.",
        "year2026": "An injury teaches you the importance of rest — listen to it."
      },
      "遷移宮": {
        "hint": "You travel for conquest — every journey has a mission.",
        "body": "Travel for you is purposeful and driven. You go places to achieve something. Competitive travel or adventure travel suits your warrior spirit.",
        "year2026": "A journey with a clear mission succeeds beyond expectations."
      },
      "交友宮": {
        "hint": "You attract warriors — your team is fierce and loyal.",
        "body": "Colleagues respect your intensity and courage. You create a high-performance culture. Your challenge is balancing drive with compassion.",
        "year2026": "A team member's fierceness becomes your greatest asset."
      },
      "官祿宮": {
        "hint": "Your career is a battlefield — you rise through decisive action.",
        "body": "You excel in competitive environments. Entrepreneurship, military, sports, or high-stakes business suits you. Your professional path involves overcoming significant challenges.",
        "year2026": "A career battle you win defines your reputation."
      },
      "田宅宮": {
        "hint": "Your home is your fortress — secure, strong, and defensible.",
        "body": "You need a home that feels secure. Good security, solid construction, and a commanding location matter to you. A home with a view of your domain appeals.",
        "year2026": "A property decision made with courage and clarity succeeds."
      },
      "福德宮": {
        "hint": "Your spiritual path is one of the warrior — discipline is your prayer.",
        "body": "You are drawn to martial spiritual traditions — Zen, the Bhagavad Gita, or warrior codes. Your spiritual practice involves discipline and service to something greater.",
        "year2026": "A spiritual discipline you undertake transforms your inner world."
      },
      "父母宮": {
        "hint": "Your parents shaped your warrior spirit — they taught you to fight.",
        "body": "Your upbringing may have been challenging, forging your strength. You learned to fight for what matters. Healing involves laying down armor that no longer serves you.",
        "year2026": "Reconciling with your past makes you a wiser warrior."
      }
    }
  },
  "破軍": {
    "cn": "破軍",
    "en": "Po Jun · Destroyer",
    "nature": "Revolutionary",
    "readings": {
      "命宮": {
        "hook": "You destroy everything you touch — and rebuild it better than before.",
        "body": "Po Jun in the Life Palace makes you revolutionary, disruptive, and transformative. You are a natural agent of change. Your life path involves breaking old structures to create new ones.",
        "year2026": "A destruction you initiate clears the way for something better."
      },
      "兄弟宮": {
        "hint": "Your siblings may fear your revolutionary nature — change disrupts family patterns.",
        "body": "Family dynamics with Po Jun involve upheaval. You may have been the black sheep or the one who broke family traditions. Your path requires forging your own way.",
        "year2026": "A family pattern you break liberates not just you but future generations."
      },
      "夫妻宮": {
        "hint": "You need a partner who is not afraid of change — stability bores you.",
        "body": "In love, you need excitement and transformation. A predictable relationship suffocates you. Your ideal partner is someone who grows and changes with you.",
        "year2026": "A relationship transformation — ending or rebirth — is necessary."
      },
      "子女宮": {
        "hint": "Your children are born revolutionaries — they will challenge every norm.",
        "body": "Creative work for you is about destruction and rebirth. You dismantle old forms and create new ones. Your legacy is one of revolutionary change.",
        "year2026": "A creative project that disrupts your field gains momentum."
      },
      "財帛宮": {
        "hint": "Your wealth comes through disruption — you profit from change.",
        "body": "You excel in startups, innovation, real estate flipping, or any field involving transformation. Your earning potential grows when you embrace change rather than stability.",
        "year2026": "A financial disruption leads to a better structure."
      },
      "疾厄宮": {
        "hint": "Your body undergoes cycles of destruction and renewal — like the seasons.",
        "body": "Po Jun affects the endocrine system and elimination. You need regular detoxification and renewal cycles. Your health improves through periodic radical changes.",
        "year2026": "A health reset this year creates long-term benefits."
      },
      "遷移宮": {
        "hint": "Travel transforms you — every journey changes who you are.",
        "body": "You travel for transformation. You are drawn to places that challenge your worldview. Extreme or unconventional travel appeals to your revolutionary nature.",
        "year2026": "A journey this year fundamentally changes your direction."
      },
      "交友宮": {
        "hint": "You attract people who are not afraid of change — your team embraces disruption.",
        "body": "Colleagues who join you know things will change. You create environments of innovation and transformation. Your challenge is maintaining stability for those who need it.",
        "year2026": "A team restructuring creates a more innovative environment."
      },
      "官祿宮": {
        "hint": "Your career path is one of innovation and transformation.",
        "body": "You excel in startups, innovation, creative destruction, or any field where you can break things and rebuild. Your professional legacy is one of transformation.",
        "year2026": "A career reinvention positions you for your next phase."
      },
      "田宅宮": {
        "hint": "Your home goes through cycles — you destroy and rebuild.",
        "body": "You may renovate, move, or completely transform your living space multiple times. You are drawn to fixer-uppers. A home that allows transformation suits you.",
        "year2026": "A home renovation project redefines your living experience."
      },
      "福德宮": {
        "hint": "Your spiritual path is one of death and rebirth — the phoenix is your symbol.",
        "body": "You are drawn to traditions that embrace change and transformation. The phoenix myth, Shiva the destroyer, or any tradition of sacred destruction resonates with you.",
        "year2026": "A spiritual death makes way for rebirth."
      },
      "父母宮": {
        "hint": "Your relationship with your parents taught you what needed to change.",
        "body": "Your upbringing may have shown you patterns you swore to break. You learned what not to repeat. Healing involves gratitude for the lessons, even in the destruction.",
        "year2026": "Breaking a family pattern brings profound liberation."
      }
    }
  }
};
