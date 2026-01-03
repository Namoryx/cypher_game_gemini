import { SoundManager } from "./audio.js";

// === 1. SVG Asset Generators ===
        const SVGLibrary = {
            quokkaFace: () => `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full"><circle cx="50" cy="50" r="45" fill="#FFFFFF" stroke="#E5E5E5" stroke-width="2"/><circle cx="30" cy="35" r="10" fill="#8B5E3C"/><circle cx="70" cy="35" r="10" fill="#8B5E3C"/><rect x="25" y="30" width="50" height="50" rx="20" fill="#8B5E3C"/><rect x="35" y="40" width="30" height="30" rx="10" fill="#D4A373"/><rect x="32" y="45" width="15" height="10" rx="2" fill="#0066CC"/><rect x="53" y="45" width="15" height="10" rx="2" fill="#0066CC"/><circle cx="50" cy="60" r="3" fill="#3E2723"/><path d="M45 65 Q50 70 55 65" stroke="#3E2723" stroke-width="2" stroke-linecap="round" fill="none"/></svg>`,
            nodeIcon: () => `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full"><circle cx="50" cy="50" r="40" fill="#E2F2FE" stroke="#0066CC" stroke-width="4"/><text x="50" y="55" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="20" fill="#0066CC">Node</text></svg>`,
            relIcon: () => `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full"><circle cx="20" cy="50" r="15" fill="#E5E5E5" stroke-dasharray="4 2" stroke="#999" stroke-width="2"/><circle cx="80" cy="50" r="15" fill="#E5E5E5" stroke-dasharray="4 2" stroke="#999" stroke-width="2"/><line x1="35" y1="50" x2="60" y2="50" stroke="#0066CC" stroke-width="4"/><polygon points="60,40 65,50 60,60" fill="#0066CC"/></svg>`,
            tableIcon: () => `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full"><rect x="15" y="20" width="70" height="60" rx="4" fill="#F5F5F5" stroke="#999" stroke-width="2"/><line x1="15" y1="40" x2="85" y2="40" stroke="#999" stroke-width="2"/><line x1="15" y1="60" x2="85" y2="60" stroke="#999" stroke-width="2"/><line x1="50" y1="20" x2="50" y2="80" stroke="#999" stroke-width="2"/></svg>`,
            propIcon: () => `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full"><rect x="20" y="20" width="60" height="60" rx="4" fill="#FFF8E1" stroke="#FFC107" stroke-width="2"/><line x1="30" y1="35" x2="70" y2="35" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/><line x1="30" y1="50" x2="60" y2="50" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/><line x1="30" y1="65" x2="50" y2="65" stroke="#FFC107" stroke-width="3" stroke-linecap="round"/></svg>`,
            codeSyntax: (text) => `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full"><rect x="5" y="30" width="90" height="40" rx="4" fill="#2D2D2D"/><text x="50" y="55" text-anchor="middle" font-family="monospace" font-size="12" fill="#4CAF50">${text || '</>'}</text></svg>`,
            defaultIcon: () => `<svg viewBox="0 0 100 100" fill="none" class="w-full h-full"><rect x="20" y="20" width="60" height="60" rx="8" fill="#E0E0E0"/><text x="50" y="55" text-anchor="middle" font-family="Arial" font-size="30" fill="#999">?</text></svg>`
        };

        // === Application Logic ===
        const app = {
            data: {}, // Filled in init
            
            state: {
                currentTrack: "Core",
                currentStep: 0,
                lives: 5,
                isDeathOverlayActive: false,
                lastDeathTaunt: null,
                selectedOption: null,
                selectedWords: [],
                isCheckMode: true,
                isTestMode: false,
                isInputLocked: false,
                testScore: 0,
                testResults: {},
                sessionQuestions: []
            },

            deathTauntPools: {
                general: [
                    "그래프는 친절하지만, 쉽진 않죠.",
                    "실패도 진행도예요. 다시 갑시다.",
                    "이번 판은 데이터로 남겼습니다.",
                    "5초면… 다시 질 준비 완료."
                ],
                Core: [
                    "기본기부터 다시. 이게 제일 빠릅니다.",
                    "처음이 제일 어렵죠. 그래서 “코어”입니다.",
                    "한 줄 차이가 승패를 가릅니다."
                ],
                Aggregation: [
                    "숫자는 거짓말 안 하는데, 가끔 우리를 운다게 합니다.",
                    "모으는 건 쉽고, “잘” 모으는 게 어렵죠.",
                    "집계는… 마음까지 합치긴 어렵네요."
                ],
                Paths: [
                    "길은 많습니다. 정답으로 가는 길만 적을 뿐.",
                    "경로는 이어지는데, 멘탈은 끊기네요.",
                    "돌아가도 됩니다. 어차피 그래프는 원형이니까."
                ],
                Modeling: [
                    "설계는 미리 고생하는 기술입니다.",
                    "모델링은 정답이 아니라 ‘덜 후회하는 선택’이죠.",
                    "잘 만든 모델은… 당신을 배신하지 않습니다. (대부분)"
                ]
            },

            init: function() {
                this.populateData(); 
                SoundManager.init();
                document.addEventListener('keydown', (e) => {
                    if (e.key === 'Escape') this.closeModal();
                });
                this.renderTracks();
            },

            populateData: function() {
               this.data["Core"] = [
                    { type: "select_concept", instruction: "다음 중 'Graph Node(노드)'를 나타내는 것을 고르세요.", hint: "노드는 그래프의 개체(Entity)입니다.", correctIndex: 1, options: [{text:"Relationship", imgType:"relIcon"}, {text:"Node", imgType:"nodeIcon"}, {text:"Table", imgType:"tableIcon"}, {text:"Property", imgType:"propIcon"}]},
                    { type: "query_builder", instruction: "모든 노드를 찾아 반환하는 쿼리를 완성하세요.", hint: "MATCH 구문 사용", correctOrder: ["MATCH", "(n)", "RETURN", "n"], wordBank: ["(n)", "WHERE", "RETURN", "MATCH", "CREATE", "DELETE", "n"], codeContext: "Graph Query"},
                    { type: "select_concept", instruction: "노드와 노드 사이의 연결은?", hint: "화살표입니다.", correctIndex: 0, options: [{text:"Relationship", imgType:"relIcon"}, {text:"Node", imgType:"nodeIcon"}, {text:"Schema", imgType:"tableIcon"}, {text:"Label", imgType:"codeSyntax", syntax:":Label"}]},
                    { type: "query_builder", instruction: "'Person' 라벨을 가진 노드를 찾으세요.", hint: ":Person 사용", correctOrder: ["MATCH", "(p:Person)", "RETURN", "p"], wordBank: ["(p:Person)", "MATCH", "RETURN", "p", "WHERE", "LIMIT"], codeContext: "Graph Query"},
                    { type: "select_concept", instruction: "키-값 쌍의 데이터는?", hint: "속성입니다.", correctIndex: 3, options: [{text:"Node", imgType:"nodeIcon"}, {text:"Label", imgType:"codeSyntax", syntax:":Label"}, {text:"Pattern", imgType:"relIcon"}, {text:"Property", imgType:"propIcon"}]},
                    { type: "query_builder", instruction: "이름이 'Neo'인 노드를 찾으세요.", hint: "WHERE 사용", correctOrder: ["MATCH", "(n)", "WHERE", "n.name = 'Neo'", "RETURN", "n"], wordBank: ["n.name = 'Neo'", "MATCH", "(n)", "RETURN", "WHERE", "n", "AND"], codeContext: "Filter Query"},
                    { type: "select_concept", instruction: "노드 표현 괄호는?", hint: "둥근 괄호", correctIndex: 0, options: [{text:"( )", imgType:"codeSyntax", syntax:"(n)"}, {text:"[ ]", imgType:"codeSyntax", syntax:"[r]" }, {text:"{ }", imgType:"codeSyntax", syntax:"{p:1}"}, {text:"< >", imgType:"codeSyntax", syntax:"<n>"}]},
                    { type: "query_builder", instruction: "'Movie' 노드를 생성하세요.", hint: "CREATE 사용", correctOrder: ["CREATE", "(m:Movie)", "RETURN", "m"], wordBank: ["CREATE", "(m:Movie)", "MATCH", "RETURN", "m", "DELETE"], codeContext: "Create Node"},
                    { type: "select_concept", instruction: "관계 표현 괄호는?", hint: "대괄호", correctIndex: 1, options: [{text:"( )", imgType:"codeSyntax", syntax:"(n)"}, {text:"[ ]", imgType:"codeSyntax", syntax:"[r]" }, {text:"{ }", imgType:"codeSyntax", syntax:"{k:v}"}, {text:"/ /", imgType:"codeSyntax", syntax:"/r/"}]},
                    { type: "query_builder", instruction: "'Alice' -> 'Bob' 관계 찾기", hint: "화살표 사용", correctOrder: ["MATCH", "(a {name:'Alice'})", "-[:KNOWS]->", "(b {name:'Bob'})", "RETURN", "*"], wordBank: ["-[:KNOWS]->", "(a {name:'Alice'})", "(b {name:'Bob'})", "MATCH", "RETURN", "*", "WHERE"], codeContext: "Match Pattern"},
                    { type: "select_concept", instruction: "노드 그룹화 역할은?", hint: "라벨", correctIndex: 2, options: [{text:"Property", imgType:"propIcon"}, {text:"Variable", imgType:"codeSyntax", syntax:"n"}, {text:"Label", imgType:"codeSyntax", syntax:":Person"}, {text:"Map", imgType:"codeSyntax", syntax:"{}"}]},
                    { type: "query_builder", instruction: "Person의 이름만 반환", hint: "p.name", correctOrder: ["MATCH", "(p:Person)", "RETURN", "p.name"], wordBank: ["p.name", "MATCH", "(p:Person)", "RETURN", "p", "WHERE"], codeContext: "Return Property"},
                    { type: "select_concept", instruction: "속성 수정 명령어", hint: "SET", correctIndex: 0, options: [{text:"SET", imgType:"codeSyntax", syntax:"SET"}, {text:"ADD", imgType:"codeSyntax", syntax:"ADD"}, {text:"UPDATE", imgType:"codeSyntax", syntax:"UPDATE"}, {text:"CREATE", imgType:"codeSyntax", syntax:"CREATE"}]},
                    { type: "query_builder", instruction: "'Neo' 나이 30 설정", hint: "SET n.age", correctOrder: ["MATCH", "(n {name:'Neo'})", "SET", "n.age = 30"], wordBank: ["SET", "n.age = 30", "MATCH", "(n {name:'Neo'})", "RETURN", "WHERE"], codeContext: "Update Data"},
                    { type: "select_concept", instruction: "관계 포함 삭제", hint: "DETACH DELETE", correctIndex: 1, options: [{text:"DELETE", imgType:"codeSyntax", syntax:"DELETE"}, {text:"DETACH DELETE", imgType:"codeSyntax", syntax:"DETACH"}, {text:"REMOVE", imgType:"codeSyntax", syntax:"REMOVE"}, {text:"DROP", imgType:"codeSyntax", syntax:"DROP"}]},
                    { type: "query_builder", instruction: "id 100 유저 삭제", hint: "DELETE", correctOrder: ["MATCH", "(u:User)", "WHERE", "u.id = 100", "DELETE", "u"], wordBank: ["DELETE", "u", "MATCH", "(u:User)", "WHERE", "u.id = 100", "REMOVE"], codeContext: "Delete Node"},
                    { type: "select_concept", instruction: "없으면 생성, 있으면 매칭", hint: "MERGE", correctIndex: 3, options: [{text:"MAKE", imgType:"codeSyntax", syntax:"MAKE"}, {text:"GET", imgType:"codeSyntax", syntax:"GET"}, {text:"CREATE", imgType:"codeSyntax", syntax:"CREATE"}, {text:"MERGE", imgType:"codeSyntax", syntax:"MERGE"}]},
                    { type: "query_builder", instruction: "이메일 유저 MERGE", hint: "패턴 전체 확인", correctOrder: ["MERGE", "(u:User {email: 'test@a.com'})", "RETURN", "u"], wordBank: ["MERGE", "(u:User {email: 'test@a.com'})", "RETURN", "u", "CREATE", "MATCH"], codeContext: "Merge Node"},
                    { type: "select_concept", instruction: "모든 변수 반환 기호", hint: "*", correctIndex: 0, options: [{text:"*", imgType:"codeSyntax", syntax:"*"}, {text:"ALL", imgType:"codeSyntax", syntax:"ALL"}, {text:"%", imgType:"codeSyntax", syntax:"%"}, {text:"?", imgType:"codeSyntax", syntax:"?"}]},
                    { type: "query_builder", instruction: "결과 5개 제한", hint: "LIMIT", correctOrder: ["MATCH", "(n)", "RETURN", "n", "LIMIT", "5"], wordBank: ["LIMIT", "5", "MATCH", "(n)", "RETURN", "n", "ORDER BY"], codeContext: "Limit Results"}
               ];
               this.data["Aggregation"] = [
                    { type: "select_concept", instruction: "전체 행의 개수를 세는 함수는?", hint: "COUNT", correctIndex: 0, options: [{text:"COUNT(*)", imgType:"codeSyntax", syntax:"COUNT(*)"}, {text:"SUM(*)", imgType:"codeSyntax", syntax:"SUM(*)"}, {text:"TOTAL(*)", imgType:"codeSyntax", syntax:"TOTAL(*)"}, {text:"SIZE(*)", imgType:"codeSyntax", syntax:"SIZE(*)"}]},
                    { type: "query_builder", instruction: "전체 Person 노드의 수를 세세요.", hint: "count(p) 사용", correctOrder: ["MATCH", "(p:Person)", "RETURN", "count(p)"], wordBank: ["count(p)", "MATCH", "(p:Person)", "RETURN", "sum(p)", "avg(p)"], codeContext: "Aggregation"},
                    { type: "select_concept", instruction: "숫자 속성의 합계를 구하는 함수는?", hint: "SUM", correctIndex: 1, options: [{text:"ADD", imgType:"codeSyntax", syntax:"ADD()"}, {text:"SUM", imgType:"codeSyntax", syntax:"SUM()"}, {text:"PLUS", imgType:"codeSyntax", syntax:"PLUS()"}, {text:"COUNT", imgType:"codeSyntax", syntax:"COUNT()"}]},
                    { type: "query_builder", instruction: "모든 제품의 가격(price) 합계를 구하세요.", hint: "sum() 사용", correctOrder: ["MATCH", "(p:Product)", "RETURN", "sum(p.price)"], wordBank: ["sum(p.price)", "MATCH", "(p:Product)", "RETURN", "count(p)", "avg(p.price)"], codeContext: "Math Aggregation"},
                    { type: "select_concept", instruction: "평균 값을 계산하는 함수는?", hint: "Average", correctIndex: 2, options: [{text:"MEAN", imgType:"codeSyntax", syntax:"MEAN"}, {text:"MEDIAN", imgType:"codeSyntax", syntax:"MEDIAN"}, {text:"AVG", imgType:"codeSyntax", syntax:"AVG"}, {text:"MID", imgType:"codeSyntax", syntax:"MID"}]},
                    { type: "query_builder", instruction: "사용자들의 평균 나이를 구하세요.", hint: "avg() 사용", correctOrder: ["MATCH", "(u:User)", "RETURN", "avg(u.age)"], wordBank: ["avg(u.age)", "MATCH", "(u:User)", "RETURN", "sum(u.age)", "min(u.age)"], codeContext: "Math Aggregation"},
                    { type: "select_concept", instruction: "여러 값을 하나의 리스트로 묶는 함수는?", hint: "Collect", correctIndex: 0, options: [{text:"COLLECT", imgType:"codeSyntax", syntax:"COLLECT"}, {text:"LIST", imgType:"codeSyntax", syntax:"LIST"}, {text:"GROUP", imgType:"codeSyntax", syntax:"GROUP"}, {text:"ARRAY", imgType:"codeSyntax", syntax:"ARRAY"}]},
                    { type: "query_builder", instruction: "배우별로 출연한 영화 제목들을 리스트로 만드세요.", hint: "collect(m.title) 사용", correctOrder: ["MATCH", "(a:Actor)-[:ACTED_IN]->(m:Movie)", "RETURN", "a.name,", "collect(m.title)"], wordBank: ["collect(m.title)", "MATCH", "(a:Actor)-[:ACTED_IN]->(m:Movie)", "RETURN", "a.name,", "sum(m.title)"], codeContext: "List Creation"},
                    { type: "select_concept", instruction: "중복을 제거하고 세려면?", hint: "DISTINCT", correctIndex: 1, options: [{text:"UNIQUE", imgType:"codeSyntax", syntax:"UNIQUE"}, {text:"DISTINCT", imgType:"codeSyntax", syntax:"DISTINCT"}, {text:"SINGLE", imgType:"codeSyntax", syntax:"SINGLE"}, {text:"ONLY", imgType:"codeSyntax", syntax:"ONLY"}]},
                    { type: "query_builder", instruction: "영화 장르(genre)의 종류 수를 세세요 (중복 제거).", hint: "count(DISTINCT ...)", correctOrder: ["MATCH", "(m:Movie)", "RETURN", "count(DISTINCT m.genre)"], wordBank: ["count(DISTINCT m.genre)", "MATCH", "(m:Movie)", "RETURN", "count(m.genre)", "sum(m.genre)"], codeContext: "Distinct Count"},
                    { type: "select_concept", instruction: "최댓값을 구하는 함수는?", hint: "Maximum", correctIndex: 3, options: [{text:"TOP", imgType:"codeSyntax", syntax:"TOP"}, {text:"HIGH", imgType:"codeSyntax", syntax:"HIGH"}, {text:"PEAK", imgType:"codeSyntax", syntax:"PEAK"}, {text:"MAX", imgType:"codeSyntax", syntax:"MAX"}]},
                    { type: "query_builder", instruction: "가장 비싼 제품의 가격을 찾으세요.", hint: "max() 사용", correctOrder: ["MATCH", "(p:Product)", "RETURN", "max(p.price)"], wordBank: ["max(p.price)", "MATCH", "(p:Product)", "RETURN", "top(p.price)", "avg(p.price)"], codeContext: "Math Aggregation"},
                    { type: "select_concept", instruction: "Cypher에서 그룹화(Group By)는 어떻게 하나요?", hint: "집계 함수가 아닌 컬럼 기준 자동 그룹화", correctIndex: 0, options: [{text:"암시적 (Implicit)", imgType:"tableIcon"}, {text:"GROUP BY 절", imgType:"codeSyntax", syntax:"GROUP BY"}, {text:"CLUSTER", imgType:"codeSyntax", syntax:"CLUSTER"}, {text:"BUCKET", imgType:"codeSyntax", syntax:"BUCKET"}]},
                    { type: "query_builder", instruction: "사용자별 친구 수를 구하세요.", hint: "u.name을 기준으로 자동 그룹화됩니다.", correctOrder: ["MATCH", "(u:User)-[:FRIEND]->(f)", "RETURN", "u.name,", "count(f)"], wordBank: ["count(f)", "MATCH", "(u:User)-[:FRIEND]->(f)", "RETURN", "u.name,", "sum(f)"], codeContext: "Implicit Grouping"},
                    { type: "select_concept", instruction: "최솟값을 구하는 함수는?", hint: "Minimum", correctIndex: 1, options: [{text:"LOW", imgType:"codeSyntax", syntax:"LOW"}, {text:"MIN", imgType:"codeSyntax", syntax:"MIN"}, {text:"BOTTOM", imgType:"codeSyntax", syntax:"BOTTOM"}, {text:"SMALL", imgType:"codeSyntax", syntax:"SMALL"}]},
                    { type: "query_builder", instruction: "가장 오래된 영화의 개봉 연도를 구하세요.", hint: "min() 사용", correctOrder: ["MATCH", "(m:Movie)", "RETURN", "min(m.year)"], wordBank: ["min(m.year)", "MATCH", "(m:Movie)", "RETURN", "max(m.year)", "count(m.year)"], codeContext: "Math Aggregation"},
                    { type: "select_concept", instruction: "리스트의 길이를 반환하는 함수는?", hint: "크기(Size)", correctIndex: 2, options: [{text:"LENGTH", imgType:"codeSyntax", syntax:"LENGTH"}, {text:"COUNT", imgType:"codeSyntax", syntax:"COUNT"}, {text:"SIZE", imgType:"codeSyntax", syntax:"SIZE"}, {text:"WIDTH", imgType:"codeSyntax", syntax:"WIDTH"}]},
                    { type: "query_builder", instruction: "친구 수가 많은 순서대로 정렬하세요.", hint: "ORDER BY count(...) DESC", correctOrder: ["MATCH", "(u:User)-[:FRIEND]->(f)", "RETURN", "u.name, count(f)", "ORDER BY", "count(f) DESC"], wordBank: ["ORDER BY", "count(f) DESC", "MATCH", "(u:User)-[:FRIEND]->(f)", "RETURN", "u.name, count(f)", "ASC"], codeContext: "Sorting Aggregation"},
                    { type: "select_concept", instruction: "중간 집계를 수행하고 다음 단계로 넘기는 절은?", hint: "파이프라인", correctIndex: 0, options: [{text:"WITH", imgType:"codeSyntax", syntax:"WITH"}, {text:"NEXT", imgType:"codeSyntax", syntax:"NEXT"}, {text:"THEN", imgType:"codeSyntax", syntax:"THEN"}, {text:"PASS", imgType:"codeSyntax", syntax:"PASS"}]},
                    { type: "query_builder", instruction: "친구 수가 5명 이상인 유저만 필터링하세요 (WITH 사용).", hint: "WITH로 집계 후 WHERE", correctOrder: ["MATCH", "(u:User)-[:FRIEND]->(f)", "WITH", "u, count(f) as cnt", "WHERE", "cnt >= 5", "RETURN", "u"], wordBank: ["WITH", "u, count(f) as cnt", "WHERE", "cnt >= 5", "RETURN", "u", "MATCH", "(u:User)-[:FRIEND]->(f)"], codeContext: "Intermediate Aggregation"}
               ];
               this.data["Paths"] = [
                    { type: "select_concept", instruction: "가변 길이 경로(Variable Length Path) 표현법은?", hint: "* 기호 사용", correctIndex: 0, options: [{text:"-[:REL*]->", imgType:"codeSyntax", syntax:"-[:R*]->"}, {text:"-[:REL?]->", imgType:"codeSyntax", syntax:"-[:R?]->"}, {text:"-[:REL+]->", imgType:"codeSyntax", syntax:"-[:R+]->"}, {text:"-[:REL.]->", imgType:"codeSyntax", syntax:"-[:R.]->"}]},
                    { type: "query_builder", instruction: "친구의 친구(2단계)를 찾으세요.", hint: "*2 사용", correctOrder: ["MATCH", "(a)-[:FRIEND*2]->(b)", "RETURN", "b"], wordBank: ["MATCH", "(a)-[:FRIEND*2]->(b)", "RETURN", "b", "WHERE", "[:FRIEND]"], codeContext: "Fixed Hop"},
                    { type: "select_concept", instruction: "1단계에서 3단계 사이의 경로를 표현하면?", hint: "*min..max", correctIndex: 1, options: [{text:"*1-3", imgType:"codeSyntax", syntax:"*1-3"}, {text:"*1..3", imgType:"codeSyntax", syntax:"*1..3"}, {text:"*1:3", imgType:"codeSyntax", syntax:"*1:3"}, {text:"*1,3", imgType:"codeSyntax", syntax:"*1,3"}]},
                    { type: "query_builder", instruction: "1~5단계 사이의 경로를 찾으세요.", hint: "*1..5", correctOrder: ["MATCH", "(a)-[*1..5]->(b)", "RETURN", "b"], wordBank: ["MATCH", "(a)-[*1..5]->(b)", "RETURN", "b", "LIMIT", "SKIP"], codeContext: "Var Hop"},
                    { type: "select_concept", instruction: "경로(Path) 자체를 변수에 할당하려면?", hint: "p = ...", correctIndex: 2, options: [{text:"SET p", imgType:"codeSyntax", syntax:"SET p"}, {text:"AS p", imgType:"codeSyntax", syntax:"AS p"}, {text:"p =", imgType:"codeSyntax", syntax:"p ="}, {text:"IN p", imgType:"codeSyntax", syntax:"IN p"}]},
                    { type: "query_builder", instruction: "경로 전체를 변수 p에 담아 반환하세요.", hint: "p = (a)-->(b)", correctOrder: ["MATCH", "p = (a)-[:KNOWS]->(b)", "RETURN", "p"], wordBank: ["p = (a)-[:KNOWS]->(b)", "MATCH", "RETURN", "p", "WHERE"], codeContext: "Path Variable"},
                    { type: "select_concept", instruction: "경로의 길이(관계 수)를 구하는 함수는?", hint: "Length", correctIndex: 0, options: [{text:"length(p)", imgType:"codeSyntax", syntax:"length()"}, {text:"size(p)", imgType:"codeSyntax", syntax:"size()"}, {text:"count(p)", imgType:"codeSyntax", syntax:"count()"}, {text:"depth(p)", imgType:"codeSyntax", syntax:"depth()"}]},
                    { type: "query_builder", instruction: "길이가 2보다 큰 경로만 찾으세요.", hint: "length(p) > 2", correctOrder: ["MATCH", "p = (a)-[*]->(b)", "WHERE", "length(p) > 2", "RETURN", "p"], wordBank: ["length(p) > 2", "MATCH", "p = (a)-[*]->(b)", "RETURN", "p", "WHERE"], codeContext: "Path Length Filter"},
                    { type: "select_concept", instruction: "두 노드 간의 최단 경로를 찾는 함수는?", hint: "Shortest", correctIndex: 3, options: [{text:"minPath", imgType:"codeSyntax", syntax:"minPath"}, {text:"fastPath", imgType:"codeSyntax", syntax:"fastPath"}, {text:"quickPath", imgType:"codeSyntax", syntax:"quickPath"}, {text:"shortestPath", imgType:"codeSyntax", syntax:"shortestPath"}]},
                    { type: "query_builder", instruction: "Alice와 Bob 사이의 최단 경로를 찾으세요.", hint: "shortestPath(...)", correctOrder: ["MATCH", "p = shortestPath(", "(a {name:'Alice'})-[*]-(b {name:'Bob'})", ")", "RETURN", "p"], wordBank: ["p = shortestPath(", "(a {name:'Alice'})-[*]-(b {name:'Bob'})", ")", "RETURN", "p", "MATCH", "WHERE"], codeContext: "Shortest Path"},
                    { type: "select_concept", instruction: "모든 최단 경로를 찾는 함수는?", hint: "All Shortest", correctIndex: 1, options: [{text:"shortestPaths", imgType:"codeSyntax", syntax:"shortestPaths"}, {text:"allShortestPaths", imgType:"codeSyntax", syntax:"allShortestPaths"}, {text:"everyShortestPath", imgType:"codeSyntax", syntax:"everyShortestPath"}, {text:"manyShortestPaths", imgType:"codeSyntax", syntax:"manyShortestPaths"}]},
                    { type: "query_builder", instruction: "가능한 모든 최단 경로를 반환하세요.", hint: "allShortestPaths(...)", correctOrder: ["MATCH", "p = allShortestPaths((a)-[*]-(b))", "RETURN", "p"], wordBank: ["MATCH", "p = allShortestPaths((a)-[*]-(b))", "RETURN", "p", "limit"], codeContext: "All Shortest"},
                    { type: "select_concept", instruction: "무제한 경로 탐색 시 주의할 점은?", hint: "성능 문제", correctIndex: 0, options: [{text:"성능 저하/메모리 부족", imgType:"defaultIcon"}, {text:"데이터 삭제됨", imgType:"defaultIcon"}, {text:"인덱스 파괴", imgType:"defaultIcon"}, {text:"서버 재부팅", imgType:"defaultIcon"}]},
                    { type: "select_concept", instruction: "경로에서 노드 리스트를 추출하는 함수는?", hint: "nodes()", correctIndex: 2, options: [{text:"getNodes(p)", imgType:"codeSyntax"}, {text:"vertex(p)", imgType:"codeSyntax"}, {text:"nodes(p)", imgType:"codeSyntax"}, {text:"points(p)", imgType:"codeSyntax"}]},
                    { type: "query_builder", instruction: "경로 p에 포함된 모든 노드를 반환하세요.", hint: "nodes(p)", correctOrder: ["MATCH", "p = (a)-->(b)", "RETURN", "nodes(p)"], wordBank: ["nodes(p)", "MATCH", "p = (a)-->(b)", "RETURN", "relationships(p)"], codeContext: "Extract Nodes"},
                    { type: "select_concept", instruction: "경로에서 관계 리스트를 추출하는 함수는?", hint: "relationships()", correctIndex: 1, options: [{text:"rels(p)", imgType:"codeSyntax"}, {text:"relationships(p)", imgType:"codeSyntax"}, {text:"edges(p)", imgType:"codeSyntax"}, {text:"links(p)", imgType:"codeSyntax"}]},
                    { type: "query_builder", instruction: "경로 p의 모든 관계를 반환하세요.", hint: "relationships(p)", correctOrder: ["MATCH", "p = (a)-[*]->(b)", "RETURN", "relationships(p)"], wordBank: ["relationships(p)", "MATCH", "p = (a)-[*]->(b)", "RETURN", "nodes(p)"], codeContext: "Extract Rels"},
                    { type: "select_concept", instruction: "방향을 무시하고 경로를 찾으려면?", hint: "화살표 머리 제거", correctIndex: 0, options: [{text:"(a)--(b)", imgType:"codeSyntax", syntax:"(a)--(b)"}, {text:"(a)->(b)", imgType:"codeSyntax", syntax:"(a)->(b)"}, {text:"(a)<-(b)", imgType:"codeSyntax", syntax:"(a)<-(b)"}, {text:"(a)>>(b)", imgType:"codeSyntax", syntax:"(a)>>(b)"}]},
                    { type: "query_builder", instruction: "0단계(자기 자신)부터 1단계까지 찾으세요.", hint: "*0..1", correctOrder: ["MATCH", "(a)-[*0..1]->(b)", "RETURN", "b"], wordBank: ["MATCH", "(a)-[*0..1]->(b)", "RETURN", "b", "SKIP"], codeContext: "Zero Hop"},
                    { type: "select_concept", instruction: "특정 관계 유형만 거쳐가는 가변 경로는?", hint: "[:TYPE*]", correctIndex: 1, options: [{text:"-[:*TYPE]->", imgType:"codeSyntax"}, {text:"-[:TYPE*]->", imgType:"codeSyntax"}, {text:"-[*:TYPE]->", imgType:"codeSyntax"}, {text:"-[TYPE]->", imgType:"codeSyntax"}]}
                ];
                this.data["Modeling"] = [
                    { type: "select_concept", instruction: "관계형 DB의 Join 테이블은 그래프에서 무엇으로 표현되나요?", hint: "N:M 연결", correctIndex: 1, options: [{text:"Node", imgType:"nodeIcon"}, {text:"Relationship", imgType:"relIcon"}, {text:"Property", imgType:"propIcon"}, {text:"Label", imgType:"codeSyntax"}]},
                    { type: "query_builder", instruction: "User가 Product를 구매(BOUGHT)한 관계를 생성하세요.", hint: "(:User)-[:BOUGHT]->(:Product)", correctOrder: ["CREATE", "(u:User)-[:BOUGHT]->(p:Product)"], wordBank: ["CREATE", "(u:User)-[:BOUGHT]->(p:Product)", "MATCH", "RETURN"], codeContext: "Modeling Relationship"},
                    { type: "select_concept", instruction: "그래프 모델링에서 '동사(Verb)'는 주로 무엇에 해당합니까?", hint: "행동", correctIndex: 0, options: [{text:"Relationship", imgType:"relIcon"}, {text:"Node", imgType:"nodeIcon"}, {text:"Property", imgType:"propIcon"}, {text:"Index", imgType:"codeSyntax"}]},
                    { type: "query_builder", instruction: "회원이 특정 그룹에 '가입(JOINED)'한 날짜 속성을 관계에 추가하세요.", hint: "관계 속성 설정", correctOrder: ["MATCH", "(u:User)-[r:JOINED]->(g:Group)", "SET", "r.date = '2023-01-01'"], wordBank: ["SET", "r.date = '2023-01-01'", "MATCH", "(u:User)-[r:JOINED]->(g:Group)", "CREATE"], codeContext: "Relationship Property"},
                    { type: "select_concept", instruction: "노드에 너무 많은 속성을 넣는 대신 분리해야 하는 경우는?", hint: "정규화/복잡도", correctIndex: 2, options: [{text:"속성이 1개일 때", imgType:"defaultIcon"}, {text:"항상 분리", imgType:"defaultIcon"}, {text:"복잡한 구조/반복 데이터", imgType:"defaultIcon"}, {text:"절대 분리 안 함", imgType:"defaultIcon"}]},
                    { type: "query_builder", instruction: "주소(Address)를 별도 노드로 분리하여 연결하세요.", hint: "User -> Address", correctOrder: ["CREATE", "(u:User)-[:LIVES_AT]->(a:Address)"], wordBank: ["CREATE", "(u:User)-[:LIVES_AT]->(a:Address)", "MERGE", "DELETE"], codeContext: "Extract Node"},
                    { type: "select_concept", instruction: "이메일처럼 고유해야 하는 속성에 걸어야 하는 제약조건은?", hint: "Unique", correctIndex: 0, options: [{text:"Uniqueness Constraint", imgType:"codeSyntax"}, {text:"Existence Constraint", imgType:"codeSyntax"}, {text:"Key Constraint", imgType:"codeSyntax"}, {text:"Node Constraint", imgType:"codeSyntax"}]},
                    { type: "query_builder", instruction: "User의 email 속성에 유니크 제약조건을 생성하세요.", hint: "CREATE CONSTRAINT", correctOrder: ["CREATE CONSTRAINT", "FOR (u:User)", "REQUIRE", "u.email IS UNIQUE"], wordBank: ["CREATE CONSTRAINT", "FOR (u:User)", "REQUIRE", "u.email IS UNIQUE", "DROP", "INDEX"], codeContext: "Constraint"},
                    { type: "select_concept", instruction: "검색 속도를 높이기 위해 생성해야 하는 것은?", hint: "책의 찾아보기", correctIndex: 1, options: [{text:"Constraint", imgType:"codeSyntax"}, {text:"Index", imgType:"codeSyntax"}, {text:"Label", imgType:"codeSyntax"}, {text:"Trigger", imgType:"codeSyntax"}]},
                    { type: "query_builder", instruction: "Product의 name 속성에 인덱스를 생성하세요.", hint: "CREATE INDEX", correctOrder: ["CREATE INDEX", "FOR (p:Product)", "ON", "(p.name)"], wordBank: ["CREATE INDEX", "FOR (p:Product)", "ON", "(p.name)", "DROP", "UNIQUE"], codeContext: "Index"},
                    { type: "select_concept", instruction: "시간 정보를 모델링할 때 'Time Tree' 패턴을 쓰는 이유는?", hint: "범위 검색", correctIndex: 0, options: [{text:"년/월/일 계층 탐색 용이", imgType:"relIcon"}, {text:"용량 절약", imgType:"defaultIcon"}, {text:"자동 삭제", imgType:"defaultIcon"}, {text:"예쁘게 보임", imgType:"defaultIcon"}]},
                    { type: "query_builder", instruction: "2023년 -> 1월 -> 1일 계층 구조를 연결하세요.", hint: "(:Year)-[:HAS_MONTH]->...", correctOrder: ["CREATE", "(y:Year {val:2023})-[:HAS]->(m:Month {val:1})"], wordBank: ["CREATE", "(y:Year {val:2023})-[:HAS]->(m:Month {val:1})", "MATCH", "MERGE"], codeContext: "Time Tree"},
                    { type: "select_concept", instruction: "방향성이 없는 상호 관계(예: 맞팔) 모델링 방법은?", hint: "두 개의 관계 or 무방향 쿼리", correctIndex: 2, options: [{text:"관계 없음", imgType:"defaultIcon"}, {text:"노드 합치기", imgType:"defaultIcon"}, {text:"양방향 관계 생성 or 쿼리 시 방향 무시", imgType:"relIcon"}, {text:"속성으로 처리", imgType:"propIcon"}]},
                    { type: "select_concept", instruction: "하이퍼엣지(3개 이상의 노드 연결)를 그래프로 표현하려면?", hint: "중간 노드 도입", correctIndex: 0, options: [{text:"중간 노드(Intermediate Node) 사용", imgType:"nodeIcon"}, {text:"관계에 관계 연결", imgType:"defaultIcon"}, {text:"속성 배열", imgType:"propIcon"}, {text:"불가능", imgType:"defaultIcon"}]},
                    { type: "query_builder", instruction: "User, Role, Group을 연결하는 Membership 노드를 만드세요.", hint: "중간 노드 연결", correctOrder: ["CREATE", "(u)-[:HAS]->(m:Membership)-[:IN]->(g)"], wordBank: ["CREATE", "(u)-[:HAS]->(m:Membership)-[:IN]->(g)", "DELETE", "REMOVE"], codeContext: "Intermediate Node"},
                    { type: "select_concept", instruction: "자주 같이 조회되는 데이터를 모델링할 때 고려할 점은?", hint: "클러스터링", correctIndex: 1, options: [{text:"분산 저장", imgType:"defaultIcon"}, {text:"연관된 노드끼리 연결(Locality)", imgType:"relIcon"}, {text:"CSV 파일 저장", imgType:"defaultIcon"}, {text:"인덱스 제거", imgType:"defaultIcon"}]},
                    { type: "query_builder", instruction: "특정 카테고리에 속한 제품들을 연결하세요.", hint: "(:Product)-[:IN_CATEGORY]->", correctOrder: ["MATCH", "(p:Product), (c:Category)", "CREATE", "(p)-[:IN_CATEGORY]->(c)"], wordBank: ["CREATE", "(p)-[:IN_CATEGORY]->(c)", "MATCH", "(p:Product), (c:Category)", "RETURN"], codeContext: "Categorization"},
                    { type: "select_concept", instruction: "Linked List(연결 리스트) 패턴은 언제 유용한가요?", hint: "순서", correctIndex: 0, options: [{text:"이벤트/로그 순서 유지", imgType:"relIcon"}, {text:"랜덤 데이터", imgType:"defaultIcon"}, {text:"비정형 데이터", imgType:"defaultIcon"}, {text:"이미지 저장", imgType:"defaultIcon"}]},
                    { type: "query_builder", instruction: "이전 이벤트(prev)와 다음 이벤트(next)를 연결하세요.", hint: "(:Event)-[:NEXT]->(:Event)", correctOrder: ["MATCH", "(prev:Event), (next:Event)", "CREATE", "(prev)-[:NEXT]->(next)"], wordBank: ["CREATE", "(prev)-[:NEXT]->(next)", "MATCH", "(prev:Event), (next:Event)", "MERGE"], codeContext: "Linked List"},
                    { type: "select_concept", instruction: "슈퍼 노드(Super Node)란?", hint: "관계가 너무 많음", correctIndex: 3, options: [{text:"속성이 많은 노드", imgType:"propIcon"}, {text:"관리자 노드", imgType:"nodeIcon"}, {text:"새로 만든 노드", imgType:"defaultIcon"}, {text:"연결된 관계가 매우 많은 노드", imgType:"relIcon"}]}
                ];
            },

            // --- Shuffle Logic ---
            shuffleArray: function(array) {
                const newArr = [...array];
                for (let i = newArr.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
                }
                return newArr;
            },

            // --- Excel Upload Handler ---
            showTemplateInfo: function() {
                alert("엑셀 파일에 다음 헤더를 포함해주세요:\n\nTrack, Type, Instruction, Hint, CorrectAnswer, Options, WordBank, ImgType");
            },

            handleFileUpload: function(input) {
                const file = input.files[0];
                if(!file) return;

                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const data = new Uint8Array(e.target.result);
                        const workbook = XLSX.read(data, {type: 'array'});
                        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
                        this.processExcelData(jsonData);
                    } catch (error) {
                        alert("파일 오류.");
                    }
                };
                reader.readAsArrayBuffer(file);
            },

            processExcelData: function(data) {
                const newLessonData = {};
                data.forEach(row => {
                    const track = row.Track || "Imported";
                    if(!newLessonData[track]) newLessonData[track] = [];
                    const type = (row.Type || "").toLowerCase().includes("query") ? "query_builder" : "select_concept";
                    let question = {
                        type: type,
                        instruction: row.Instruction,
                        hint: row.Hint,
                        imgType: row.ImgType || "defaultIcon"
                    };
                    if(type === "select_concept") {
                        const opts = (row.Options || "").split('|');
                        question.options = opts.map(o => ({ text: o.trim(), imgType: this.guessImgType(o.trim()) }));
                        question.correctIndex = isNaN(row.CorrectAnswer) ? question.options.findIndex(o => o.text === row.CorrectAnswer) : parseInt(row.CorrectAnswer);
                        if(question.correctIndex === -1) question.correctIndex = 0;
                    } else {
                        question.correctOrder = (row.CorrectAnswer || "").split(' ');
                        question.wordBank = (row.WordBank || "").split('|');
                        question.codeContext = "Query";
                    }
                    newLessonData[track].push(question);
                });
                this.data = newLessonData;
                alert(`Loaded ${data.length} questions.`);
                this.renderTracks();
                this.goHome();
            },

            guessImgType: function(text) {
                const t = text.toLowerCase();
                if(t.includes('node')) return 'nodeIcon';
                if(t.includes('rel')) return 'relIcon';
                if(t.includes('prop')) return 'propIcon';
                if(t.includes('table')) return 'tableIcon';
                if(t.includes('return') || t.includes('match')) return 'codeSyntax';
                return 'defaultIcon';
            },

            downloadQuestionsAsExcel: function() {
                let rows = [];
                for (const [track, questions] of Object.entries(this.data)) {
                    questions.forEach(q => {
                        let row = {
                            Track: track,
                            Type: q.type,
                            Instruction: q.instruction,
                            Hint: q.hint,
                            ImgType: q.imgType || ""
                        };
                        if(q.type === 'select_concept') {
                            row.Options = q.options.map(o => o.text).join('|');
                            row.CorrectAnswer = q.correctIndex; 
                            row.WordBank = "";
                        } else {
                            row.Options = "";
                            row.CorrectAnswer = q.correctOrder.join(' ');
                            row.WordBank = q.wordBank.join('|');
                        }
                        rows.push(row);
                    });
                }
                const worksheet = XLSX.utils.json_to_sheet(rows);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
                XLSX.writeFile(workbook, "namoryx_data.xlsx");
            },

            // --- Render Logic ---
            renderTracks: function() {
                const grid = document.getElementById('track-grid');
                grid.innerHTML = '';
                Object.keys(this.data).forEach(trackName => {
                    const count = this.data[trackName].length;
                    const card = document.createElement('div');
                    card.className = "option-card rounded-2xl p-6 flex flex-col items-center gap-4 bg-white hover:bg-gray-50 transition-all transform hover:scale-105";
                    card.onclick = () => this.startLesson(trackName);
                    let iconSVG = SVGLibrary.defaultIcon();
                    if(trackName.includes('Core')) iconSVG = SVGLibrary.nodeIcon();
                    else if(trackName.includes('Path')) iconSVG = SVGLibrary.relIcon();
                    else if(trackName.includes('Model')) iconSVG = SVGLibrary.tableIcon();
                    else if(trackName.includes('Agg')) iconSVG = SVGLibrary.propIcon();
                    card.innerHTML = `<div class="w-16 h-16">${iconSVG}</div><div class="text-center"><span class="block font-extrabold text-gray-700 text-lg">${trackName}</span><span class="block text-xs text-gray-400 font-bold uppercase">${count} Lessons</span></div>`;
                    grid.appendChild(card);
                });
            },

            // --- Navigation ---
            startFlow: function() {
                document.getElementById('landing-view').classList.add('hidden');
                document.getElementById('track-view').classList.remove('hidden');
            },

            goHome: function() {
                document.getElementById('landing-view').classList.remove('hidden');
                document.getElementById('track-view').classList.add('hidden');
                document.getElementById('lesson-view').classList.add('hidden');
                document.getElementById('result-view').classList.add('hidden');
                document.getElementById('test-result-view').classList.add('hidden');
                document.getElementById('main-header').classList.remove('hidden');
                this.state.isInputLocked = false;
                this.state.currentStep = 0;
                this.state.isTestMode = false;
                Tone.Transport.stop();
                this.closeModal();
            },

            startLesson: function(trackName) {
                const originalQuestions = this.data[trackName];
                const shuffledQuestions = this.shuffleArray([...originalQuestions]);
                this.state.sessionQuestions = shuffledQuestions;
                this.state.currentTrack = trackName;
                this.state.isTestMode = false;
                this.state.isInputLocked = false;

                document.getElementById('track-view').classList.add('hidden');
                document.getElementById('main-header').classList.add('hidden');
                document.getElementById('lesson-view').classList.remove('hidden');

                this.state.currentStep = 0;
                this.state.lives = 5;
                this.state.isDeathOverlayActive = false;
                this.state.lastDeathTaunt = null;
                this.updateLives();
                this.renderQuestion();
                Tone.start();
            },

            // --- Test Mode Logic ---
            startTestMode: function() {
                let allQuestions = [];
                Object.keys(this.data).forEach(track => {
                    const labeledQuestions = this.data[track].map(q => ({...q, trackName: track}));
                    allQuestions = allQuestions.concat(labeledQuestions);
                });

                if(allQuestions.length === 0) { alert("문제가 없습니다."); return; }
                const shuffled = this.shuffleArray([...allQuestions]);
                const selectedQuestions = shuffled.slice(0, 10);

                this.state.sessionQuestions = selectedQuestions;
                this.state.currentTrack = "Test Mode";
                this.state.isTestMode = true;
                this.state.isInputLocked = false;
                this.state.testScore = 0;
                this.state.testResults = {};
                Object.keys(this.data).forEach(t => this.state.testResults[t] = {correct: 0, total: 0});

                document.getElementById('landing-view').classList.add('hidden');
                document.getElementById('test-result-view').classList.add('hidden');
                document.getElementById('main-header').classList.add('hidden');
                document.getElementById('lesson-view').classList.remove('hidden');

                this.state.currentStep = 0;
                this.state.lives = 999;
                document.getElementById('lives-count').innerText = "∞"; 
                this.renderQuestion();
                Tone.start();
            },

            finishTest: function() {
                document.getElementById('lesson-view').classList.add('hidden');
                document.getElementById('bottom-bar').classList.add('hidden');
                const resultView = document.getElementById('test-result-view');
                resultView.classList.remove('hidden');
                
                document.getElementById('test-total-score').innerText = `${this.state.testScore} / 10`;
                
                let minAcc = 101;
                let weakTrack = "";
                let breakdownHTML = "";
                
                Object.keys(this.state.testResults).forEach(track => {
                    const res = this.state.testResults[track];
                    if (res.total > 0) {
                        const acc = (res.correct / res.total) * 100;
                        if (acc < minAcc) {
                            minAcc = acc;
                            weakTrack = track;
                        }
                        breakdownHTML += `
                            <div class="flex justify-between text-sm text-gray-600">
                                <span>${track}</span>
                                <span class="font-bold">${res.correct}/${res.total}</span>
                            </div>
                            <div class="w-full bg-gray-200 rounded-full h-2 mb-2">
                                <div class="bg-[#0066CC] h-2 rounded-full" style="width: ${acc}%"></div>
                            </div>
                        `;
                    }
                });
                
                document.getElementById('test-breakdown').innerHTML = breakdownHTML;
                
                if (weakTrack) {
                    document.getElementById('test-weakness-msg').innerText = `'${weakTrack}' 파트가 가장 약합니다. 집중 공략해보세요!`;
                    document.getElementById('weakness-btn').onclick = () => {
                        this.startLesson(weakTrack);
                        document.getElementById('test-result-view').classList.add('hidden');
                    };
                    document.getElementById('weakness-btn').classList.remove('hidden');
                } else {
                    document.getElementById('test-weakness-msg').innerText = "완벽합니다! 모든 트랙을 마스터했습니다.";
                    document.getElementById('weakness-btn').classList.add('hidden');
                }
                
                SoundManager.playCorrect();
            },

            // --- Shared Game Logic ---
            requestQuit: function() { document.getElementById('quit-modal').classList.remove('hidden'); },
            closeModal: function() { document.getElementById('quit-modal').classList.add('hidden'); },
            confirmQuit: function() {
                this.closeModal();
                this.goHome();
            },
            handleModalClick: function(e) { if (e.target.id === 'quit-modal') this.closeModal(); },

            updateLives: function() { 
                if(!this.state.isTestMode) document.getElementById('lives-count').innerText = this.state.lives; 
            },
            updateProgress: function() {
                const track = this.state.sessionQuestions;
                if(!track) return;
                const pct = ((this.state.currentStep) / track.length) * 100;
                document.getElementById('progress-bar').style.width = `${pct}%`;
            },

            getDeathTaunt: function(trackName) {
                const pool = this.deathTauntPools[trackName] || this.deathTauntPools.general;
                if (!pool || pool.length === 0) return "";

                let choice = pool[Math.floor(Math.random() * pool.length)];
                if (pool.length > 1 && choice === this.state.lastDeathTaunt) {
                    let attempts = 0;
                    while (choice === this.state.lastDeathTaunt && attempts < 5) {
                        choice = pool[Math.floor(Math.random() * pool.length)];
                        attempts++;
                    }
                    if (choice === this.state.lastDeathTaunt) {
                        const idx = pool.indexOf(choice);
                        choice = pool[(idx + 1) % pool.length];
                    }
                }

                this.state.lastDeathTaunt = choice;
                return choice;
            },

            showDeathOverlay: function(trackName, onComplete) {
                if (this.state.isDeathOverlayActive) {
                    if (typeof onComplete === 'function') onComplete();
                    return;
                }
                this.state.isDeathOverlayActive = true;

                const overlayCopy = {
                    title: 'YOU DIED',
                    status: 'LIFE 0 · 5초 후 재도전',
                    taunt: this.getDeathTaunt(trackName)
                };

                const appRoot = document.getElementById('app-root');
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                const resizeCanvas = () => {
                    canvas.width = window.innerWidth;
                    canvas.height = window.innerHeight;
                };

                resizeCanvas();

                Object.assign(canvas.style, {
                    position: 'fixed',
                    inset: '0',
                    width: '100vw',
                    height: '100vh',
                    pointerEvents: 'none',
                    zIndex: '50'
                });

                appRoot.appendChild(canvas);

                const fadeInDuration = 800;
                const holdDuration = 3500;
                const fadeOutDuration = 900;
                let start = null;

                const renderOverlay = (alpha) => {
                    const { width, height } = canvas;
                    const bandHeight = Math.min(height * 0.35, 260);
                    const y = (height - bandHeight) / 2;
                    const centerY = height / 2;

                    ctx.clearRect(0, 0, width, height);

                    ctx.globalAlpha = alpha * 0.6;
                    ctx.fillStyle = '#000000';
                    ctx.fillRect(0, 0, width, height);

                    ctx.globalAlpha = alpha;
                    const gradient = ctx.createLinearGradient(0, y + bandHeight / 2, width, y + bandHeight / 2);
                    gradient.addColorStop(0, '#000000');
                    gradient.addColorStop(0.5, '#2b0000');
                    gradient.addColorStop(1, '#000000');
                    ctx.fillStyle = gradient;
                    ctx.fillRect(0, y, width, bandHeight);

                    const titleSize = Math.min(width * 0.08, 96);
                    const statusSize = Math.min(width * 0.035, 36);
                    const tauntSize = Math.min(width * 0.032, 30);

                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';

                    ctx.font = `700 ${titleSize}px "Cinzel", serif`;
                    ctx.fillStyle = `rgba(200, 0, 0, ${alpha})`;
                    ctx.fillText(overlayCopy.title, width / 2, centerY - statusSize * 0.8);

                    ctx.font = `600 ${statusSize}px "Inter", sans-serif`;
                    ctx.fillStyle = `rgba(255, 240, 240, ${alpha})`;
                    ctx.fillText(overlayCopy.status, width / 2, centerY + statusSize * 0.2);

                    ctx.font = `500 ${tauntSize}px "Inter", sans-serif`;
                    ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
                    ctx.fillText(overlayCopy.taunt, width / 2, centerY + statusSize * 1.8);
                };

                const cleanup = () => {
                    window.removeEventListener('resize', resizeCanvas);
                    canvas.remove();
                    this.state.isDeathOverlayActive = false;
                };

                const step = (timestamp) => {
                    if (start === null) start = timestamp;
                    const elapsed = timestamp - start;
                    const totalDuration = fadeInDuration + holdDuration + fadeOutDuration;
                    let alpha;

                    if (elapsed < fadeInDuration) {
                        alpha = elapsed / fadeInDuration;
                    } else if (elapsed < fadeInDuration + holdDuration) {
                        alpha = 1;
                    } else if (elapsed < totalDuration) {
                        alpha = 1 - ((elapsed - fadeInDuration - holdDuration) / fadeOutDuration);
                    } else {
                        cleanup();
                        if (typeof onComplete === 'function') onComplete();
                        return;
                    }

                    renderOverlay(alpha);
                    requestAnimationFrame(step);
                };

                window.addEventListener('resize', resizeCanvas);
                requestAnimationFrame(step);
            },

            renderQuestion: function() {
                const track = this.state.sessionQuestions;
                if (!track || !track[this.state.currentStep]) {
                    if(this.state.isTestMode) this.finishTest();
                    else this.showCompleteScreen();
                    return;
                }
                const q = track[this.state.currentStep];
                const container = document.getElementById('question-container');
                container.innerHTML = '';
                
                this.resetBottomBar();
                this.state.selectedOption = null;
                this.state.selectedWords = [];
                this.updateProgress();

                const header = document.createElement('h2');
                header.className = "text-xl md:text-2xl font-bold text-gray-700 mb-6 text-center w-full";
                header.innerHTML = q.instruction;
                container.appendChild(header);
                
                if (q.type === 'select_concept') {
                    this.renderSelectConcept(q, container);
                } else if (q.type === 'query_builder') {
                    this.renderQueryBuilder(q, container);
                }
            },

            renderSelectConcept: function(q, container) {
                const grid = document.createElement('div');
                grid.className = "grid grid-cols-2 gap-4 w-full max-w-lg";
                q.options.forEach((opt, idx) => {
                    const card = document.createElement('div');
                    card.className = "option-card rounded-2xl p-4 flex flex-col items-center gap-3 bg-white";
                    card.dataset.index = idx;
                    card.onclick = () => this.selectOption(idx, card);
                    const imgContainer = document.createElement('div');
                    imgContainer.className = "w-20 h-20 md:w-28 md:h-28";
                    if (opt.imgType === 'codeSyntax') imgContainer.innerHTML = SVGLibrary.codeSyntax(opt.syntax || opt.text);
                    else if (SVGLibrary[opt.imgType]) imgContainer.innerHTML = SVGLibrary[opt.imgType]();
                    else imgContainer.innerHTML = SVGLibrary.defaultIcon();
                    
                    const label = document.createElement('span');
                    label.className = "text-gray-600 font-bold text-lg text-center break-words w-full";
                    label.innerText = opt.text;
                    card.appendChild(imgContainer);
                    card.appendChild(label);
                    grid.appendChild(card);
                });
                container.appendChild(grid);
            },

            renderQueryBuilder: function(q, container) {
                const bubbleRow = document.createElement('div');
                bubbleRow.className = "flex items-start gap-4 mb-6 w-full max-w-2xl px-2";
                const mascotContainer = document.createElement('div');
                mascotContainer.className = "w-14 h-14 rounded-full border border-gray-200 bg-white shrink-0 overflow-hidden";
                mascotContainer.innerHTML = SVGLibrary.quokkaFace();
                const bubble = document.createElement('div');
                bubble.className = "relative p-4 border-2 border-gray-200 rounded-2xl rounded-tl-none bg-white text-base font-medium text-gray-600 shadow-sm flex-grow";
                
                if(this.state.isTestMode) {
                     bubble.innerHTML = `<span class="text-[#0066CC] font-bold text-xs uppercase block mb-1">Test Mode</span>힌트가 숨겨져 있습니다.`;
                } else {
                     bubble.innerHTML = `<span class="text-[#0066CC] font-bold text-xs uppercase block mb-1">Quokka Tip</span>${q.hint}`;
                }

                bubbleRow.appendChild(mascotContainer);
                bubbleRow.appendChild(bubble);
                container.appendChild(bubbleRow);

                const answerContainer = document.createElement('div');
                answerContainer.className = "w-full max-w-2xl bg-[#1E1E1E] rounded-xl p-4 mb-6 shadow-inner min-h-[80px] flex items-center flex-wrap gap-2";
                answerContainer.id = "answer-line";
                container.appendChild(answerContainer);

                const wordBank = document.createElement('div');
                wordBank.className = "flex flex-wrap gap-2 justify-center w-full max-w-2xl";
                
                const shuffled = this.shuffleArray([...q.wordBank]);
                shuffled.forEach(word => {
                    const btn = document.createElement('button');
                    btn.className = "btn-3d bg-white border border-gray-200 border-b-4 px-3 py-2 rounded-lg text-gray-700 font-bold font-code text-sm hover:bg-gray-50 active:translate-y-1 active:border-b-2 transition-colors";
                    btn.innerText = word;
                    btn.onclick = () => this.toggleWord(word, btn, answerContainer, wordBank);
                    wordBank.appendChild(btn);
                });
                container.appendChild(wordBank);
            },

            selectOption: function(index, cardEl) {
                if (this.state.isInputLocked) return;
                document.querySelectorAll('.option-card').forEach(c => c.classList.remove('selected'));
                cardEl.classList.add('selected');
                this.state.selectedOption = index;
                this.enableCheckButton();
            },

            toggleWord: function(word, btnEl, answerLine, wordBank) {
                if (this.state.isInputLocked) return;
                const isInLine = btnEl.parentElement === answerLine;
                if (isInLine) {
                    const idx = this.state.selectedWords.indexOf(word);
                    if (idx > -1) this.state.selectedWords.splice(idx, 1);
                    wordBank.appendChild(btnEl);
                    btnEl.classList.remove('bg-gray-700', 'text-white', 'border-gray-900');
                    btnEl.classList.add('bg-white', 'text-gray-700', 'border-gray-200');
                } else {
                    this.state.selectedWords.push(word);
                    answerLine.appendChild(btnEl);
                    btnEl.classList.remove('bg-white', 'text-gray-700', 'border-gray-200');
                    btnEl.classList.add('bg-gray-700', 'text-white', 'border-gray-900');
                }
                this.state.selectedWords.length > 0 ? this.enableCheckButton() : this.disableCheckButton();
            },

            enableCheckButton: function() {
                const btn = document.getElementById('check-btn');
                btn.classList.remove('btn-gray');
                btn.classList.add('btn-green');
                btn.disabled = false;
            },
            disableCheckButton: function() {
                const btn = document.getElementById('check-btn');
                btn.classList.add('btn-gray');
                btn.classList.remove('btn-green');
                btn.disabled = true;
            },
            resetBottomBar: function() {
                const bar = document.getElementById('bottom-bar');
                bar.className = "fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 md:p-8 z-40";
                document.getElementById('feedback-area').classList.add('hidden');
                document.getElementById('check-btn').classList.remove('hidden');
                document.getElementById('continue-btn').classList.add('hidden');
                this.disableCheckButton();
                this.state.isCheckMode = true;
            },

            checkAnswer: function() {
                if (this.state.isInputLocked) return;
                const track = this.state.sessionQuestions;
                const q = track[this.state.currentStep];
                let isCorrect = false;
                let correctText = "";

                if (q.type === 'select_concept') {
                    isCorrect = (this.state.selectedOption === q.correctIndex);
                    correctText = q.options[q.correctIndex].text;
                } else if (q.type === 'query_builder') {
                    const attempt = this.state.selectedWords.join(' ').replace(/\s+/g, '').toLowerCase();
                    const truth = q.correctOrder.join(' ').replace(/\s+/g, '').toLowerCase();
                    isCorrect = (attempt === truth);
                    correctText = q.correctOrder.join(' ');
                }
                
                // Record Stats for Test Mode
                if(this.state.isTestMode) {
                    const trackName = q.trackName || "Core"; 
                    if(!this.state.testResults[trackName]) this.state.testResults[trackName] = {correct:0, total:0};
                    this.state.testResults[trackName].total++;
                    if(isCorrect) {
                        this.state.testResults[trackName].correct++;
                        this.state.testScore++;
                    }
                }

                this.showFeedback(isCorrect, correctText);
            },

            showFeedback: function(isCorrect, message) {
                const bar = document.getElementById('bottom-bar');
                const feedbackArea = document.getElementById('feedback-area');
                const feedbackIcon = document.getElementById('feedback-icon');
                const feedbackTitle = document.getElementById('feedback-title');
                const feedbackText = document.getElementById('feedback-text');
                const checkBtn = document.getElementById('check-btn');
                const continueBtn = document.getElementById('continue-btn');

                feedbackArea.classList.remove('hidden');
                checkBtn.classList.add('hidden');
                continueBtn.classList.remove('hidden');

                if (isCorrect) {
                    bar.classList.remove('bg-white', 'border-gray-200');
                    bar.classList.add('bg-[#D7FFB8]', 'border-transparent');
                    feedbackIcon.innerHTML = `<span class="material-symbols-outlined text-[#58CC02]">check</span>`;
                    feedbackTitle.innerText = "Query Executed Successfully!";
                    feedbackTitle.className = "font-extrabold text-xl text-[#58CC02]";
                    feedbackText.innerText = "";
                    SoundManager.playCorrect();
                } else {
                    bar.classList.remove('bg-white', 'border-gray-200');
                    bar.classList.add('bg-[#FFDFE0]', 'border-transparent');
                    feedbackIcon.innerHTML = `<span class="material-symbols-outlined text-[#FF4B4B]">error</span>`;
                    feedbackTitle.innerText = "Syntax Error";
                    feedbackTitle.className = "font-extrabold text-xl text-[#FF4B4B]";
                    feedbackText.innerText = `Correct: ${message}`;
                    SoundManager.playWrong();

                    if(!this.state.isTestMode) {
                        const previousLives = this.state.lives;
                        if (previousLives > 0) {
                            this.state.lives--;
                            this.updateLives();
                            if(this.state.lives <= 0) {
                                 this.showDeathOverlay(this.state.currentTrack, () => {
                                    this.confirmQuit();
                                 });
                                 return;
                            }
                        }
                    }
                }
                this.state.isCheckMode = false;
            },

            nextQuestion: function() {
                if (this.state.isInputLocked) return;
                const track = this.state.sessionQuestions;
                this.state.currentStep++;
                if (this.state.currentStep >= track.length) {
                    if(this.state.isTestMode) this.finishTest();
                    else this.showCompleteScreen();
                } else {
                    this.renderQuestion();
                }
            },

            showCompleteScreen: function() {
                document.getElementById('lesson-view').classList.add('hidden');
                document.getElementById('bottom-bar').classList.add('hidden');
                document.getElementById('result-view').classList.remove('hidden');
                document.getElementById('app-root').appendChild(document.getElementById('result-view'));
                SoundManager.playCorrect();
            }
        };

export function initGame() {
    window.app = app;
    app.init();
}
