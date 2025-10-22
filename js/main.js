// ========================================
// Horizontal Slide Navigation System
// ======================================== //

function setupSlideNavigation() {
    const slides = document.querySelectorAll('.slide');
    const progressIndicator = document.getElementById('progress-indicator');
    let currentSlide = 0;

    // Create progress dots
    slides.forEach((slide, index) => {
        const dot = document.createElement('div');
        dot.className = 'progress-dot';
        if (index === 0) dot.classList.add('active');
        
        dot.addEventListener('click', () => {
            slides[index].scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
        });
        
        progressIndicator.appendChild(dot);
    });

    const dots = document.querySelectorAll('.progress-dot');

    // Update active dot on scroll
    const updateActiveDot = () => {
        const scrollPosition = window.scrollX + window.innerWidth / 2;

        slides.forEach((slide, index) => {
            const rect = slide.getBoundingClientRect();
            const slideLeft = window.scrollX + rect.left;
            const slideRight = slideLeft + slide.offsetWidth;

            if (scrollPosition >= slideLeft && scrollPosition < slideRight) {
                if (currentSlide !== index) {
                    currentSlide = index;
                    dots.forEach(d => d.classList.remove('active'));
                    dots[index].classList.add('active');
                    window.dispatchEvent(new CustomEvent('slideChange', {
                        detail: { index, element: slide }
                    }));
                }
            }
        });
    };

    window.addEventListener('scroll', updateActiveDot);

    // Keyboard navigation - HORIZONTAL
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            e.preventDefault();
            if (currentSlide < slides.length - 1) {
                slides[currentSlide + 1].scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
            }
        } else if (e.key === 'ArrowLeft') {
            e.preventDefault();
            if (currentSlide > 0) {
                slides[currentSlide - 1].scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'start' });
            }
        }
    });

    // Emit initial slide event after layout settles
    if (slides.length > 0) {
        window.dispatchEvent(new CustomEvent('slideChange', {
            detail: { index: 0, element: slides[0] }
        }));
    }
}

// ========================================
// Graph Visualization (Structure Augmentation)
// Story-Based Approach: Shows how recommendation path breaks
// ========================================

class GraphVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.isAugmented = false;
        this.isHovering = false;
        this.isAnimating = false;

        this.initializeGraph();
    }

    initializeGraph() {
        // Create SVG
        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Create groups for different layers (order matters for z-index)
        this.pathGroup = this.svg.append('g').attr('class', 'paths');
        this.linkGroup = this.svg.append('g').attr('class', 'links');
        this.nodeGroup = this.svg.append('g').attr('class', 'nodes');
        this.labelGroup = this.svg.append('g').attr('class', 'labels');

        // Add instruction text
        this.instructionText = this.labelGroup.append('text')
            .attr('x', this.width / 2)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#667eea')
            .attr('font-size', '13px')
            .attr('font-weight', 'bold')
            .attr('id', 'instruction-text')
            .text('👆 Pasa el mouse sobre "Usuario 1" para ver su potencial de recomendación');

        this.createStoryData();
        this.render();
    }

    createStoryData() {
        const userX = this.width * 0.28;
        const itemX = this.width * 0.62;

        this.nodes = [
            { id: 'user1', type: 'user', label: 'Usuario 1\n(Tú)', x: userX, y: 110, labelPosition: 'belowStrict' },
            { id: 'user2', type: 'user', label: 'Usuario 2\n(Similar)', x: userX, y: 220, labelPosition: 'belowStrict' },
            { id: 'user3', type: 'user', label: 'Usuario 3\n(Fan Fundación)', x: userX, y: 340, labelPosition: 'belowStrict' },
            { id: 'itemA', type: 'item', label: 'Ítem A\n"Dune"', x: itemX, y: 90, labelPosition: 'belowStrict' },
            { id: 'itemB', type: 'item', label: 'Ítem B\n"Hyperion"', x: itemX, y: 220, labelPosition: 'belowStrict' },
            { id: 'itemC', type: 'item', label: 'Ítem C\n"Fundación"', x: itemX, y: 360, labelPosition: 'belowStrict' }
        ];

        this.links = [
            { id: 'link1', source: 'user1', target: 'itemA', label: 'Leíste', removed: false },
            { id: 'link2', source: 'user1', target: 'itemB', label: 'Leíste', removed: false },
            { id: 'link3', source: 'user2', target: 'itemB', label: 'También leyó', removed: false },
            { id: 'link4', source: 'user2', target: 'itemC', label: 'También leyó', removed: false, critical: true },
            { id: 'link5', source: 'user3', target: 'itemC', label: 'Fan declarado', removed: false }
        ];

        // The recommendation path: user1 -> itemB -> user2 -> itemC
        this.recommendationPath = ['user1', 'itemB', 'user2', 'itemC'];
    }

    render() {
        // Render links
        const links = this.linkGroup.selectAll('line')
            .data(this.links, d => d.id);

        const linksEnter = links.enter()
            .append('line')
            .attr('class', 'link');

        links.merge(linksEnter)
            .attr('x1', d => {
                const source = this.nodes.find(n => n.id === d.source);
                return source.x;
            })
            .attr('y1', d => {
                const source = this.nodes.find(n => n.id === d.source);
                return source.y;
            })
            .attr('x2', d => {
                const target = this.nodes.find(n => n.id === d.target);
                return target.x;
            })
            .attr('y2', d => {
                const target = this.nodes.find(n => n.id === d.target);
                return target.y;
            })
            .attr('class', d => {
                if (d.removed) return 'link-broken';
                return 'link';
            })
            .attr('stroke', d => d.removed ? '#ef4444' : '#a0aec0')
            .attr('stroke-width', d => d.removed ? 3 : 2)
            .attr('stroke-dasharray', d => d.removed ? '5,5' : 'none');

        // Render nodes
        const nodes = this.nodeGroup.selectAll('g')
            .data(this.nodes, d => d.id);

        const nodesEnter = nodes.enter()
            .append('g')
            .attr('transform', d => `translate(${d.x}, ${d.y})`)
            .attr('class', 'node-group')
            .style('cursor', d => d.id === 'user1' ? 'pointer' : 'default')
            .on('mouseenter', (event, d) => {
                if (d.id === 'user1') {
                    this.isHovering = true;
                    this.showRecommendationPath();
                }
            })
            .on('mouseleave', (event, d) => {
                if (d.id === 'user1') {
                    this.isHovering = false;
                    this.hideRecommendationPath();
                }
            });

        // Add shapes based on type
        nodesEnter.each((d, i, nodeList) => {
            const g = d3.select(nodeList[i]);
            if (d.type === 'user') {
                g.append('circle')
                    .attr('r', 20)
                    .attr('class', 'node-shape node-user')
                    .attr('fill', '#4299e1')
                    .attr('stroke', '#2c5282')
                    .attr('stroke-width', 2);
            } else {
                g.append('rect')
                    .attr('x', -25)
                    .attr('y', -25)
                    .attr('width', 50)
                    .attr('height', 50)
                    .attr('rx', 5)
                    .attr('class', 'node-shape node-item')
                    .attr('fill', '#48bb78')
                    .attr('stroke', '#276749')
                    .attr('stroke-width', 2);
            }

            // Add label below node
            const lines = d.label.split('\n');
            const lineSpacing = 14;
            const position = d.labelPosition || 'below';
            let baseOffset;

            switch (position) {
                case 'above':
                    baseOffset = -(lineSpacing * lines.length) - 6;
                    break;
                case 'center':
                    baseOffset = -((lineSpacing * (lines.length - 1)) / 2);
                    break;
                case 'belowStrict':
                    baseOffset = 35;
                    break;
                case 'below':
                default:
                    baseOffset = 35;
                    if (d.y > this.height - 110) {
                        baseOffset = -(lineSpacing * (lines.length - 1) + 26);
                    }
                    break;
            }

            lines.forEach((line, idx) => {
                g.append('text')
                    .attr('class', 'node-label')
                    .attr('y', baseOffset + idx * lineSpacing)
                    .attr('text-anchor', 'middle')
                    .attr('fill', '#2d3748')
                    .attr('font-size', '11px')
                    .attr('font-weight', idx === 0 ? 'bold' : 'normal')
                    .text(line);
            });
        });
    }

    showRecommendationPath() {
        if (this.isAugmented) {
            // If augmented and critical link is broken, show broken path
            const criticalLink = this.links.find(l => l.critical);
            if (criticalLink && criticalLink.removed) {
                this.highlightPartialPath();
                this.instructionText
                    .transition().duration(200)
                    .style('opacity', 0)
                    .transition().duration(200)
                    .text('❌ La recomendación está rota. El camino a "Fundación" ya no existe.')
                    .style('opacity', 1);
                return;
            }
        }

        // Dim all non-path nodes
        this.dimNonPathNodes(this.recommendationPath);

        // Show full recommendation path
        this.pathGroup.selectAll('*').remove();

        // Draw the path: user1 -> itemB -> user2 -> itemC
        const pathSegments = [
            ['user1', 'itemB'],
            ['itemB', 'user2'],
            ['user2', 'itemC']
        ];

        // Animate path segments one by one
        pathSegments.forEach((segment, idx) => {
            const source = this.nodes.find(n => n.id === segment[0]);
            const target = this.nodes.find(n => n.id === segment[1]);

            const line = this.pathGroup.append('line')
                .attr('x1', source.x)
                .attr('y1', source.y)
                .attr('x2', source.x)
                .attr('y2', source.y)
                .attr('stroke', '#10b981')
                .attr('stroke-width', 6)
                .attr('stroke-opacity', 0)
                .attr('class', 'recommendation-path');

            line.transition()
                .delay(idx * 150)
                .duration(300)
                .attr('stroke-opacity', 0.8)
                .attr('x2', target.x)
                .attr('y2', target.y);
        });

        // Highlight path nodes
        this.nodeGroup.selectAll('g')
            .filter(d => this.recommendationPath.includes(d.id))
            .classed('path-highlighted', true);

        // Add pulsing animation to itemC (the recommendation target)
        setTimeout(() => {
            this.nodeGroup.selectAll('g')
                .filter(d => d.id === 'itemC')
                .select('.node-shape')
                .classed('pulse-recommendation', true)
                .attr('stroke', '#10b981')
                .attr('stroke-width', 4);

            // Add recommendation label
            const itemC = this.nodes.find(n => n.id === 'itemC');
            this.pathGroup.append('text')
                .attr('x', itemC.x + 45)
                .attr('y', itemC.y)
                .attr('text-anchor', 'start')
                .attr('fill', '#10b981')
                .attr('font-size', '13px')
                .attr('font-weight', 'bold')
                .style('opacity', 0)
                .text('¡Recomendación Potencial!')
                .transition()
                .duration(300)
                .style('opacity', 1);
        }, 450);

        // Update instruction text
        this.instructionText
            .transition().duration(200)
            .style('opacity', 0)
            .transition().duration(200)
            .text('✅ Camino de recomendación: Usuario 1 → Hyperion → Usuario 2 → Fundación')
            .style('opacity', 1);
    }

    highlightPartialPath() {
        // Dim all non-path nodes
        this.dimNonPathNodes(['user1', 'itemB', 'user2']);

        this.pathGroup.selectAll('*').remove();

        // Show available path: user1 -> itemB -> user2 (GREEN, solid - still working!)
        const pathSegments = [
            ['user1', 'itemB'],
            ['itemB', 'user2']
        ];

        // Animate green path segments
        pathSegments.forEach((segment, idx) => {
            const source = this.nodes.find(n => n.id === segment[0]);
            const target = this.nodes.find(n => n.id === segment[1]);

            const line = this.pathGroup.append('line')
                .attr('x1', source.x)
                .attr('y1', source.y)
                .attr('x2', source.x)
                .attr('y2', source.y)
                .attr('stroke', '#10b981')
                .attr('stroke-width', 6)
                .attr('stroke-opacity', 0)
                .attr('class', 'recommendation-path');

            line.transition()
                .delay(idx * 150)
                .duration(300)
                .attr('stroke-opacity', 0.8)
                .attr('x2', target.x)
                .attr('y2', target.y);
        });

        // Highlight the working path nodes
        this.nodeGroup.selectAll('g')
            .filter(d => ['user1', 'itemB', 'user2'].includes(d.id))
            .classed('path-highlighted', true);

        // Show broken connection with X mark (after green path animation)
        setTimeout(() => {
            const user2 = this.nodes.find(n => n.id === 'user2');
            const itemC = this.nodes.find(n => n.id === 'itemC');

            this.pathGroup.append('line')
                .attr('x1', user2.x)
                .attr('y1', user2.y)
                .attr('x2', itemC.x)
                .attr('y2', itemC.y)
                .attr('stroke', '#ef4444')
                .attr('stroke-width', 5)
                .attr('stroke-opacity', 0)
                .attr('stroke-dasharray', '5,5')
                .transition()
                .duration(300)
                .attr('stroke-opacity', 0.8);

            // Add broken mark
            const midX = (user2.x + itemC.x) / 2;
            const midY = (user2.y + itemC.y) / 2;

            const brokenGroup = this.pathGroup.append('g')
                .attr('transform', `translate(${midX + 20}, ${midY})`)
                .style('opacity', 0);

            brokenGroup.append('circle')
                .attr('r', 18)
                .attr('fill', '#ef4444')
                .attr('opacity', 0.9);

            brokenGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', 5)
                .attr('fill', 'white')
                .attr('font-size', '16px')
                .attr('font-weight', 'bold')
                .text('✗');

            brokenGroup.transition()
                .duration(300)
                .style('opacity', 1);
        }, 300);
    }

    dimNonPathNodes(pathNodeIds) {
        // Dim nodes not in path
        this.nodeGroup.selectAll('.node-group')
            .transition()
            .duration(200)
            .style('opacity', d => pathNodeIds.includes(d.id) ? 1 : 0.3);

        // Strongly dim links not in path
        const pathLinks = [];
        for (let i = 0; i < pathNodeIds.length - 1; i++) {
            const link = this.links.find(l =>
                l.source === pathNodeIds[i] && l.target === pathNodeIds[i + 1]
            );
            if (link) pathLinks.push(link.id);
        }

        this.linkGroup.selectAll('line')
            .transition()
            .duration(200)
            .style('opacity', d => pathLinks.includes(d.id) ? 1 : 0.2);
    }

    hideRecommendationPath() {
        this.pathGroup.selectAll('*').remove();

        // Restore full opacity to all nodes and links
        this.nodeGroup.selectAll('.node-group')
            .transition()
            .duration(200)
            .style('opacity', 1);

        this.linkGroup.selectAll('line')
            .transition()
            .duration(200)
            .style('opacity', 1);

        // Remove highlighting and pulsing
        this.nodeGroup.selectAll('g')
            .classed('path-highlighted', false)
            .filter(d => d.id === 'itemC')
            .select('.node-shape')
            .classed('pulse-recommendation', false)
            .attr('stroke', '#276749')
            .attr('stroke-width', 2);

        // Update instruction text
        if (this.isAugmented) {
            this.instructionText
                .transition().duration(200)
                .text('La conexión se ha perdido. Ahora, vuelve a pasar el mouse sobre "Usuario 1"');
        } else {
            this.instructionText
                .transition().duration(200)
                .text('👆 Pasa el mouse sobre "Usuario 1" para ver su potencial de recomendación');
        }
    }

    async augmentStructure() {
        if (this.isAnimating) return;
        this.isAnimating = true;

        const criticalLink = this.links.find(l => l.critical);
        if (!criticalLink) return;

        // Find the critical link line element
        const criticalLinkElement = this.linkGroup.selectAll('line')
            .filter(d => d.id === criticalLink.id);

        // Animate the breaking: flash red twice then fade out
        await new Promise(resolve => {
            criticalLinkElement
                .transition().duration(250)
                .attr('stroke', '#ef4444')
                .attr('stroke-width', 5)
                .transition().duration(250)
                .attr('stroke', '#a0aec0')
                .attr('stroke-width', 2)
                .transition().duration(250)
                .attr('stroke', '#ef4444')
                .attr('stroke-width', 5)
                .transition().duration(250)
                .attr('stroke', '#ef4444')
                .attr('stroke-opacity', 0)
                .on('end', resolve);
        });

        // Mark as removed
        criticalLink.removed = true;
        this.isAugmented = true;

        // Re-render to show broken state
        this.render();

        // Update instruction
        if (this.isHovering) {
            this.showRecommendationPath();
        } else {
            this.instructionText
                .transition().duration(200)
                .style('opacity', 0)
                .transition().duration(200)
                .text('La conexión se ha perdido. Ahora, vuelve a pasar el mouse sobre "Usuario 1"')
                .style('opacity', 1);
        }

        this.isAnimating = false;
    }

    reset() {
        this.isAugmented = false;
        this.isAnimating = false;

        // Restore all links
        this.links.forEach(link => {
            link.removed = false;
        });

        this.pathGroup.selectAll('*').remove();

        // Restore full opacity
        this.nodeGroup.selectAll('.node-group').style('opacity', 1);
        this.linkGroup.selectAll('line')
            .style('opacity', 1)
            .attr('stroke', '#a0aec0')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', 'none');

        // Remove all highlights
        this.nodeGroup.selectAll('g')
            .classed('path-highlighted', false)
            .select('.node-shape')
            .classed('pulse-recommendation', false)
            .attr('stroke', d => d.type === 'user' ? '#2c5282' : '#276749')
            .attr('stroke-width', 2);

        // Re-render to ensure clean state
        this.linkGroup.selectAll('line').remove();
        this.nodeGroup.selectAll('g').remove();
        this.render();

        this.instructionText
            .style('opacity', 1)
            .text('👆 Pasa el mouse sobre "Usuario 1" para ver su potencial de recomendación');
    }
}

// ========================================
// Scatter Plot Visualization (Feature Augmentation)
// With Semantic Zones: Shows identity confusion
// ========================================

class ScatterPlotVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.margin = { top: 40, right: 20, bottom: 30, left: 50 };
        this.boundaryX = 50; // Boundary between zones
        this.currentNoise = 0;
        this.animationFrame = null;

        this.initializeScatterPlot();
    }

    initializeScatterPlot() {
        // Create SVG
        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Create semantic zones (background)
        const plotWidth = this.width - this.margin.left - this.margin.right;
        const plotHeight = this.height - this.margin.top - this.margin.bottom;

        const zonesGroup = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Sci-Fi zone (left, blue)
        zonesGroup.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', plotWidth / 2)
            .attr('height', plotHeight)
            .attr('fill', '#e0f2fe')
            .attr('opacity', 0.5);

        zonesGroup.append('text')
            .attr('x', plotWidth / 4)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#0369a1')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('Ciencia Ficción');

        // Comedy zone (right, green)
        zonesGroup.append('rect')
            .attr('x', plotWidth / 2)
            .attr('y', 0)
            .attr('width', plotWidth / 2)
            .attr('height', plotHeight)
            .attr('fill', '#dcfce7')
            .attr('opacity', 0.5);

        zonesGroup.append('text')
            .attr('x', plotWidth * 3 / 4)
            .attr('y', 20)
            .attr('text-anchor', 'middle')
            .attr('fill', '#15803d')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .text('Comedia');

        // Boundary line
        zonesGroup.append('line')
            .attr('x1', plotWidth / 2)
            .attr('y1', 0)
            .attr('x2', plotWidth / 2)
            .attr('y2', plotHeight)
            .attr('stroke', '#64748b')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5,5');

        // Create group for points
        this.pointGroup = this.svg.append('g')
            .attr('class', 'points')
            .attr('transform', `translate(${this.margin.left}, ${this.margin.top})`);

        // Create scales
        this.xScale = d3.scaleLinear()
            .domain([0, 100])
            .range([0, plotWidth]);

        this.yScale = d3.scaleLinear()
            .domain([0, 100])
            .range([plotHeight, 0]);

        // Alert text for identity confusion (positioned above axis label)
        this.alertGroup = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left}, ${this.height - 30})`);

        this.alertText = this.alertGroup.append('text')
            .attr('x', (this.width - this.margin.left - this.margin.right) / 2)
            .attr('y', 0)
            .attr('text-anchor', 'middle')
            .attr('fill', '#ef4444')
            .attr('font-size', '13px')
            .attr('font-weight', 'bold')
            .style('opacity', 0);

        // Add axis labels
        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', this.width / 2)
            .attr('y', this.height - 5)
            .attr('text-anchor', 'middle')
            .text('Dimensión Latente 1');

        this.svg.append('text')
            .attr('class', 'axis-label')
            .attr('x', -this.height / 2)
            .attr('y', 12)
            .attr('text-anchor', 'middle')
            .attr('transform', 'rotate(-90)')
            .text('Dimensión Latente 2');

        // Create initial data
        this.createInitialData();
        this.render();
    }

    createInitialData() {
        // Power User: Large head node in center of Sci-Fi zone (safe from boundary)
        // Long Tail User: Small tail node near the boundary (vulnerable)

        this.points = [
            {
                id: 'power_user',
                type: 'head',
                label: 'Power User',
                baseX: 25,
                baseY: 50,
                r: 14,
                originalZone: 'scifi',
                curve: {
                    control1: { x: 33, y: 44 },
                    control2: { x: 38, y: 38 },
                    target: { x: 40, y: 42 }
                },
                wobble: { x: 1.2, y: 1 },
                phase: Math.PI / 3
            },
            {
                id: 'longtail_user',
                type: 'tail',
                label: 'Usuario Long Tail',
                baseX: 38,
                baseY: 52,
                r: 7,
                originalZone: 'scifi',
                curve: {
                    control1: { x: 50, y: 42 },
                    control2: { x: 68, y: 65 },
                    target: { x: 80, y: 58 }
                },
                wobble: { x: 2.6, y: 1.8 },
                phase: Math.PI * 0.15
            },
            // Background points for context
            { id: 'bg1', type: 'background', baseX: 20, baseY: 30, r: 4, curve: { control1: { x: 23, y: 25 }, control2: { x: 27, y: 22 }, target: { x: 29, y: 24 } }, wobble: { x: 1, y: 1.5 }, phase: Math.PI * 0.4 },
            { id: 'bg2', type: 'background', baseX: 30, baseY: 70, r: 4, curve: { control1: { x: 34, y: 72 }, control2: { x: 40, y: 74 }, target: { x: 42, y: 68 } }, wobble: { x: 0.8, y: 1 }, phase: Math.PI * 0.9 },
            { id: 'bg3', type: 'background', baseX: 35, baseY: 40, r: 4, curve: { control1: { x: 33, y: 45 }, control2: { x: 30, y: 50 }, target: { x: 32, y: 48 } }, wobble: { x: 0.9, y: 1.4 }, phase: Math.PI * 1.3 },
            { id: 'bg4', type: 'background', baseX: 65, baseY: 50, r: 4, curve: { control1: { x: 68, y: 46 }, control2: { x: 72, y: 48 }, target: { x: 74, y: 45 } }, wobble: { x: 1.2, y: 1 }, phase: Math.PI * 0.6 },
            { id: 'bg5', type: 'background', baseX: 70, baseY: 35, r: 4, curve: { control1: { x: 74, y: 37 }, control2: { x: 78, y: 39 }, target: { x: 80, y: 36 } }, wobble: { x: 0.7, y: 1.1 }, phase: Math.PI * 0.2 },
            { id: 'bg6', type: 'background', baseX: 80, baseY: 65, r: 4, curve: { control1: { x: 77, y: 67 }, control2: { x: 72, y: 70 }, target: { x: 74, y: 68 } }, wobble: { x: 1, y: 1.3 }, phase: Math.PI * 1.6 }
        ];

        // Mirror base positions for legacy references
        this.points = this.points.map(p => ({
            ...p,
            x: p.baseX,
            y: p.baseY
        }));
    }

    render(noiseLevel = 0) {
        // Calculate noisy positions with deterministic drifts
        const noiseFactor = noiseLevel / 100;
        const easedFactor = Math.pow(noiseFactor, 1.3);
        const smoothstep = easedFactor * easedFactor * (3 - 2 * easedFactor);
        const bezier = (p0, p1, p2, p3, t) => {
            const u = 1 - t;
            return u * u * u * p0 +
                3 * u * u * t * p1 +
                3 * u * t * t * p2 +
                t * t * t * p3;
        };

        const points = this.points.map(p => {
            const baseX = p.baseX ?? p.x;
            const baseY = p.baseY ?? p.y;
            const curve = p.curve || {
                control1: { x: baseX + (p.driftX ?? 10), y: baseY + (p.driftY ?? 5) * 0.5 },
                control2: { x: baseX + (p.driftX ?? 10) * 0.6, y: baseY + (p.driftY ?? 5) },
                target: { x: baseX + (p.driftX ?? 10), y: baseY + (p.driftY ?? 5) }
            };

            const wobbleAmp = p.wobble || { x: 0, y: 0 };
            const phase = p.phase ?? 0;
            const wobbleX = Math.sin(phase + noiseFactor * Math.PI * 2.5) * wobbleAmp.x * noiseFactor;
            const wobbleY = Math.cos(phase + noiseFactor * Math.PI * 2.1) * wobbleAmp.y * noiseFactor;

            const bezierX = bezier(baseX, curve.control1.x, curve.control2.x, curve.target.x, smoothstep);
            const bezierY = bezier(baseY, curve.control1.y, curve.control2.y, curve.target.y, smoothstep);

            const newX = Math.max(0, Math.min(100, bezierX + wobbleX));
            const newY = Math.max(0, Math.min(100, bezierY + wobbleY));

            // Determine current zone
            let currentZone = null;
            if (p.originalZone) {
                currentZone = newX < this.boundaryX ? 'scifi' : 'comedy';
            }

            return {
                ...p,
                baseX,
                baseY,
                currentX: newX,
                currentY: newY,
                currentZone: currentZone
            };
        });

        // Check if Long Tail User crossed the boundary
        const longtailUser = points.find(p => p.id === 'longtail_user');
        const identityCompromised = longtailUser && longtailUser.currentZone === 'comedy';

        // Update alert text with smooth transition
        if (identityCompromised && noiseLevel > 0) {
            this.alertText
                .text('⚠️ ¡Identidad de Usuario Long Tail comprometida! Ahora en zona "Comedia"')
                .transition()
                .duration(200)
                .style('opacity', 1);
        } else {
            this.alertText
                .transition()
                .duration(200)
                .style('opacity', 0);
        }

        // Render points
        const circles = this.pointGroup.selectAll('g')
            .data(points, d => d.id);

        const circlesEnter = circles.enter()
            .append('g');

        circlesEnter.append('circle');

        circlesEnter.append('text')
            .attr('class', 'point-label')
            .attr('y', d => d.type === 'head' ? -20 : -15)
            .attr('text-anchor', 'middle')
            .attr('font-size', '11px')
            .attr('font-weight', 'bold');

        // Smooth transitions for position and color
        const transitionDuration = noiseLevel === 0 ? 500 : 50; // Smooth return to origin

        circles.merge(circlesEnter)
            .select('circle')
            .transition()
            .duration(transitionDuration)
            .attr('cx', d => this.xScale(d.currentX))
            .attr('cy', d => this.yScale(d.currentY))
            .attr('r', d => d.r)
            .attr('fill', d => {
                if (d.type === 'background') return '#cbd5e0';
                if (d.type === 'head') return '#0369a1'; // Deep blue for head
                if (d.currentZone === 'comedy') return '#15803d'; // Green when crossed
                return '#0284c7'; // Light blue for tail in scifi
            })
            .attr('stroke', d => {
                if (d.type === 'background') return '#94a3b8';
                if (d.type === 'head') return '#1e40af';
                if (d.currentZone === 'comedy') return '#166534';
                return '#0369a1';
            })
            .attr('stroke-width', d => {
                if (d.type === 'background') return 1;
                if (d.currentZone === 'comedy' && d.id === 'longtail_user') return 3;
                return 2;
            });

        circles.merge(circlesEnter)
            .select('text')
            .transition()
            .duration(transitionDuration)
            .attr('x', d => this.xScale(d.currentX))
            .attr('y', d => this.yScale(d.currentY) - (d.type === 'head' ? 20 : 15))
            .text(d => d.label || '')
            .attr('fill', d => {
                if (d.currentZone === 'comedy') return '#15803d';
                return '#0369a1';
            });

        circles.exit().remove();
    }

    updateNoise(noiseLevel) {
        this.currentNoise = noiseLevel;
        this.render(noiseLevel);
    }
}

// ========================================
// Matrix Visualization (Sparse Data Problem)
// ========================================

class MatrixVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.gridSize = 20; // 20x20 grid to enfatize sparsity (~1%)
        this.cellSize = Math.min(this.width, this.height) / (this.gridSize + 3);

        this.initializeMatrix();
        this.setupSlideListener();

        // If the slide is visible on load (e.g., refresh mid-presentation), run the animation once.
        setTimeout(() => {
            if (this.isSlideInViewport()) {
                this.animateObservedCells();
            }
        }, 300);
    }

    initializeMatrix() {
        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Create grid data
        this.cells = [];
        const observed = [
            [1, 4], [3, 12], [6, 2], [9, 18], [12, 7]
        ];

        // Calculate offset to center the grid
        this.gridTotalSize = this.gridSize * this.cellSize;
        this.offsetX = (this.width - this.gridTotalSize) / 2;
        this.offsetY = (this.height - this.gridTotalSize) / 2;

        for (let row = 0; row < this.gridSize; row++) {
            for (let col = 0; col < this.gridSize; col++) {
                const isObserved = observed.some(([r, c]) => r === row && c === col);
                this.cells.push({
                    row,
                    col,
                    observed: isObserved,
                    x: this.offsetX + col * this.cellSize,
                    y: this.offsetY + row * this.cellSize
                });
            }
        }

        this.render();
    }

    render() {
        const cellGroup = this.svg.append('g');

        this.cellsSelection = cellGroup.selectAll('rect')
            .data(this.cells)
            .enter()
            .append('rect')
            .attr('x', d => d.x)
            .attr('y', d => d.y)
            .attr('width', this.cellSize - 2)
            .attr('height', this.cellSize - 2)
            .attr('fill', '#e2e8f0')
            .attr('stroke', '#cbd5e0')
            .attr('stroke-width', 1)
            .attr('rx', 2)
            .style('cursor', 'default')
            .on('mouseenter', (event, d) => {
                if (!d.observed) {
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('fill', '#fbbf24')
                        .attr('stroke', '#f59e0b')
                        .attr('stroke-width', 2);
                }
            })
            .on('mouseleave', (event, d) => {
                if (!d.observed) {
                    d3.select(event.target)
                        .transition()
                        .duration(200)
                        .attr('fill', '#e2e8f0')
                        .attr('stroke', '#cbd5e0')
                        .attr('stroke-width', 1);
                }
            });

        this.observedCells = this.cellsSelection.filter(d => d.observed);
        this.resetObservedCells();

        // Add axis labels
        this.svg.append('text')
            .attr('x', this.offsetX + this.gridTotalSize / 2)
            .attr('y', this.offsetY + this.gridTotalSize + 16)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#4a5568')
            .attr('font-weight', 'bold')
            .text('Ítems (Películas)');

        this.svg.append('text')
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', '#4a5568')
            .attr('font-weight', 'bold')
            .attr('transform', `translate(${this.offsetX - 26}, ${this.offsetY + this.gridTotalSize / 2}) rotate(-90)`)
            .text('Usuarios');
    }

    resetObservedCells() {
        if (!this.observedCells) return;
        this.observedCells
            .interrupt()
            .attr('fill', '#e2e8f0')
            .attr('stroke', '#cbd5e0')
            .attr('stroke-width', 1);
    }

    animateObservedCells() {
        if (!this.observedCells) return;
        this.resetObservedCells();
        this.observedCells
            .transition()
            .delay((d, i) => 300 + i * 200)
            .duration(450)
            .attr('fill', '#667eea')
            .attr('stroke', '#5a67d8')
            .attr('stroke-width', 2);
    }

    setupSlideListener() {
        const handler = (event) => {
            const slideEl = event.detail?.element;
            if (slideEl && slideEl.contains(this.container)) {
                this.animateObservedCells();
            }
        };
        window.addEventListener('slideChange', handler);
        this.slideChangeHandler = handler;
    }

    isSlideInViewport() {
        const slide = this.container.closest('.slide');
        if (!slide) return false;
        const rect = slide.getBoundingClientRect();
        return rect.left >= 0 && rect.left < window.innerWidth;
    }
}

// ========================================
// Augmentation Visualization (Contrastive Views)
// ========================================

class AugmentationVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.isAugmented = false;

        this.initializeVisualization();
    }

    initializeVisualization() {
        this.svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', this.width)
            .attr('height', this.height);

        // Original view
        this.originalGroup = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

        this.render();
    }

    render() {
        // Draw original graph (3 users, 3 items)
        const nodes = [
            { id: 'u1', x: -80, y: -60, type: 'user', label: 'U1' },
            { id: 'u2', x: -80, y: 0, type: 'user', label: 'U2' },
            { id: 'u3', x: -80, y: 60, type: 'user', label: 'U3' },
            { id: 'i1', x: 80, y: -60, type: 'item', label: 'I1' },
            { id: 'i2', x: 80, y: 0, type: 'item', label: 'I2' },
            { id: 'i3', x: 80, y: 60, type: 'item', label: 'I3' }
        ];

        const links = [
            { source: nodes[0], target: nodes[3] },
            { source: nodes[1], target: nodes[3] },
            { source: nodes[1], target: nodes[4] },
            { source: nodes[2], target: nodes[5] }
        ];

        // Draw title
        this.originalGroup.append('text')
            .attr('x', 0)
            .attr('y', -110)
            .attr('text-anchor', 'middle')
            .attr('font-size', '14px')
            .attr('font-weight', 'bold')
            .attr('fill', '#2d3748')
            .text('Vista Original');

        // Draw links
        this.originalGroup.selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('x1', d => d.source.x)
            .attr('y1', d => d.source.y)
            .attr('x2', d => d.target.x)
            .attr('y2', d => d.target.y)
            .attr('stroke', '#a0aec0')
            .attr('stroke-width', 2);

        // Draw nodes
        nodes.forEach(node => {
            const nodeGroup = this.originalGroup.append('g')
                .attr('transform', `translate(${node.x}, ${node.y})`);

            if (node.type === 'user') {
                nodeGroup.append('circle')
                    .attr('r', 16)
                    .attr('fill', '#4299e1')
                    .attr('stroke', '#2c5282')
                    .attr('stroke-width', 2);
            } else {
                nodeGroup.append('rect')
                    .attr('x', -16)
                    .attr('y', -16)
                    .attr('width', 32)
                    .attr('height', 32)
                    .attr('rx', 4)
                    .attr('fill', '#48bb78')
                    .attr('stroke', '#276749')
                    .attr('stroke-width', 2);
            }

            const labelLines = node.label.split('\n');
            const textElement = nodeGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', 'white')
                .attr('y', labelLines.length > 1 ? -(labelLines.length - 1) * 6 : 4);

            labelLines.forEach((line, idx) => {
                textElement.append('tspan')
                    .attr('x', 0)
                    .attr('dy', idx === 0 ? 0 : 12)
                    .text(line);
            });
        });
    }

    showAugmentedViews() {
        if (this.isAugmented) return;
        this.isAugmented = true;

        // Shrink and move original to left
        this.originalGroup
            .transition()
            .duration(600)
            .attr('transform', `translate(${this.width * 0.2}, ${this.height / 2})scale(0.65)`);

        // Create two augmented views with better spacing
        setTimeout(() => {
            this.createAugmentedView(this.width * 0.5, 'Vista 1\n(Estructura)', 'structure');
            this.createAugmentedView(this.width * 0.8, 'Vista 2\n(Features)', 'feature');

            // Update status
            document.getElementById('augmentation-status').textContent =
                '✓ El modelo compara las 3 vistas y aprende qué patrones se mantienen constantes';
        }, 650);
    }

    createAugmentedView(xPos, title, type) {
        const viewGroup = this.svg.append('g')
            .attr('transform', `translate(${xPos}, ${this.height / 2})scale(0.7)`)
            .style('opacity', 0);

        // Draw title
        const titleLines = title.split('\n');
        titleLines.forEach((line, idx) => {
            viewGroup.append('text')
                .attr('x', 0)
                .attr('y', -110 + idx * 16)
                .attr('text-anchor', 'middle')
                .attr('font-size', '13px')
                .attr('font-weight', 'bold')
                .attr('fill', '#667eea')
                .text(line);
        });

        const nodes = [
            { id: 'u1', x: -80, y: -60, type: 'user', label: 'U1' },
            { id: 'u2', x: -80, y: 0, type: 'user', label: 'U2' },
            { id: 'u3', x: -80, y: 60, type: 'user', label: 'U3' },
            { id: 'i1', x: 80, y: -60, type: 'item', label: 'I1' },
            { id: 'i2', x: 80, y: 0, type: 'item', label: 'I2' },
            { id: 'i3', x: 80, y: 60, type: 'item', label: 'I3' }
        ];

        let links = [
            { source: nodes[0], target: nodes[3], removed: false },
            { source: nodes[1], target: nodes[3], removed: false },
            { source: nodes[1], target: nodes[4], removed: false },
            { source: nodes[2], target: nodes[5], removed: false }
        ];

        // Modify based on type
        if (type === 'structure') {
            // Remove one link and mark it
            links[2].removed = true;
        }

        // Draw links
        links.forEach((link, idx) => {
            if (type === 'structure' && link.removed) {
                // Draw removed link with X mark
                const midX = (link.source.x + link.target.x) / 2;
                const midY = (link.source.y + link.target.y) / 2;

                viewGroup.append('line')
                    .attr('x1', link.source.x)
                    .attr('y1', link.source.y)
                    .attr('x2', link.target.x)
                    .attr('y2', link.target.y)
                    .attr('stroke', '#ef4444')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '4,4')
                    .attr('opacity', 0.5);

                // Add X mark
                const xGroup = viewGroup.append('g')
                    .attr('transform', `translate(${midX}, ${midY})`);

                xGroup.append('circle')
                    .attr('r', 12)
                    .attr('fill', '#ef4444')
                    .attr('opacity', 0.9);

                xGroup.append('text')
                    .attr('text-anchor', 'middle')
                    .attr('dy', 4)
                    .attr('fill', 'white')
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text('✗');
            } else {
                viewGroup.append('line')
                    .attr('x1', link.source.x)
                    .attr('y1', link.source.y)
                    .attr('x2', link.target.x)
                    .attr('y2', link.target.y)
                    .attr('stroke', '#a0aec0')
                    .attr('stroke-width', 2);
            }
        });

        // Draw nodes with visual indicators
        nodes.forEach(node => {
            const nodeGroup = viewGroup.append('g')
                .attr('transform', `translate(${node.x}, ${node.y})`);

            if (type === 'feature') {
                // Add noise indicator (dotted circle)
                nodeGroup.append('circle')
                    .attr('r', 24)
                    .attr('fill', 'none')
                    .attr('stroke', '#fbbf24')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '3,3')
                    .attr('opacity', 0.6);

                // Add small noise label
                nodeGroup.append('text')
                    .attr('y', -30)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '9px')
                    .attr('font-weight', 'bold')
                    .attr('fill', '#f59e0b')
                    .text('+ ruido');
            }

            if (node.type === 'user') {
                nodeGroup.append('circle')
                    .attr('r', 16)
                    .attr('fill', '#4299e1')
                    .attr('stroke', '#2c5282')
                    .attr('stroke-width', 2);
            } else {
                nodeGroup.append('rect')
                    .attr('x', -16)
                    .attr('y', -16)
                    .attr('width', 32)
                    .attr('height', 32)
                    .attr('rx', 4)
                    .attr('fill', '#48bb78')
                    .attr('stroke', '#276749')
                    .attr('stroke-width', 2);
            }

            nodeGroup.append('text')
                .attr('text-anchor', 'middle')
                .attr('dy', 4)
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', 'white')
                .text(node.label);
        });

        viewGroup.transition()
            .duration(400)
            .style('opacity', 1);
    }

    reset() {
        this.isAugmented = false;

        // Remove all groups and rebuild
        this.svg.selectAll('*').remove();

        // Recreate original group
        this.originalGroup = this.svg.append('g')
            .attr('transform', `translate(${this.width / 2}, ${this.height / 2})`);

        // Re-render
        this.render();

        document.getElementById('augmentation-status').textContent = '';
    }
}

// ========================================
// Alex Photos Visualization (Essence Learning)
// ========================================

class AlexPhotosVisualization {
    constructor(containerId) {
        this.containerId = containerId;
        this.container = document.getElementById(containerId);
        this.isShowingEssence = false;

        this.photos = [
            { label: 'Original\n(De frente)', type: 'original', essence: true },
            { label: 'Con bigote', type: 'mustache', essence: true },
            { label: 'Poca luz', type: 'dark', essence: true },
            { label: 'Con anteojos', type: 'glasses', essence: true }
        ];

        this.photoWidth = 100;
        this.photoHeight = 118;
        this.gap = 30;

        this.render();
    }

    render() {
        const containerWidth = this.container.clientWidth;

        const svg = d3.select(`#${this.containerId}`)
            .append('svg')
            .attr('width', '100%')
            .attr('height', 200);

        const totalWidth = this.photos.length * this.photoWidth + (this.photos.length - 1) * this.gap;
        this.startX = (containerWidth - totalWidth) / 2;

        this.photos.forEach((photo, idx) => {
            const x = this.startX + idx * (this.photoWidth + this.gap);
            const photoGroup = svg.append('g')
                .attr('class', 'photo-group')
                .attr('data-type', photo.type);

            // Photo frame
            photoGroup.append('rect')
                .attr('x', x)
                .attr('y', 20)
                .attr('width', this.photoWidth)
                .attr('height', this.photoHeight)
                .attr('fill', photo.type === 'original' ? '#667eea' : '#94a3b8')
                .attr('opacity', photo.type === 'original' ? 0.9 : 0.6)
                .attr('stroke', '#2d3748')
                .attr('stroke-width', 2)
                .attr('rx', 6);

            // Visual indicator based on type
            if (photo.type === 'mustache') {
                // Mustache will be drawn on the face below
            } else if (photo.type === 'dark') {
                // Dark overlay but with a spotlight on the face
                photoGroup.append('rect')
                    .attr('x', x)
                    .attr('y', 20)
                    .attr('width', this.photoWidth)
                    .attr('height', this.photoHeight)
                    .attr('fill', '#000')
                    .attr('opacity', 0.6)
                    .attr('rx', 6);

                // Add a subtle spotlight circle
                photoGroup.append('circle')
                    .attr('cx', x + this.photoWidth / 2)
                    .attr('cy', 70)
                    .attr('r', 35)
                    .attr('fill', 'rgba(255, 255, 255, 0.15)');
            } else if (photo.type === 'glasses') {
                // Glasses icon - better positioned on the face
                const centerX = x + this.photoWidth / 2;
                const centerY = 68; // Lower to be on the eyes
                photoGroup.append('ellipse')
                    .attr('cx', centerX - 18)
                    .attr('cy', centerY)
                    .attr('rx', 14)
                    .attr('ry', 12)
                    .attr('fill', 'rgba(30, 41, 59, 0.1)')
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 3);
                photoGroup.append('ellipse')
                    .attr('cx', centerX + 18)
                    .attr('cy', centerY)
                    .attr('rx', 14)
                    .attr('ry', 12)
                    .attr('fill', 'rgba(30, 41, 59, 0.1)')
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 3);
                photoGroup.append('line')
                    .attr('x1', centerX - 4)
                    .attr('y1', centerY)
                    .attr('x2', centerX + 4)
                    .attr('y2', centerY)
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 2);
            }

            // Face representation (simple emoji-style)
            const faceX = x + this.photoWidth / 2;
            const faceY = 70;

            if (photo.type === 'mustache') {
                // Normal front view with mustache
                // Eyes
                photoGroup.append('circle')
                    .attr('cx', faceX - 15)
                    .attr('cy', faceY)
                    .attr('r', 3)
                    .attr('fill', '#1e293b');
                photoGroup.append('circle')
                    .attr('cx', faceX + 15)
                    .attr('cy', faceY)
                    .attr('r', 3)
                    .attr('fill', '#1e293b');

                // Mustache (two curves forming a classic handlebar)
                photoGroup.append('path')
                    .attr('d', `M ${faceX - 20} ${faceY + 12} Q ${faceX - 10} ${faceY + 14} ${faceX} ${faceY + 10}`)
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 3)
                    .attr('fill', 'none')
                    .attr('stroke-linecap', 'round');

                photoGroup.append('path')
                    .attr('d', `M ${faceX} ${faceY + 10} Q ${faceX + 10} ${faceY + 14} ${faceX + 20} ${faceY + 12}`)
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 3)
                    .attr('fill', 'none')
                    .attr('stroke-linecap', 'round');

                // Smile
                photoGroup.append('path')
                    .attr('d', `M ${faceX - 15} ${faceY + 20} Q ${faceX} ${faceY + 28} ${faceX + 15} ${faceY + 20}`)
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
            } else if (photo.type !== 'dark') {
                // Normal front view - two eyes
                photoGroup.append('circle')
                    .attr('cx', faceX - 15)
                    .attr('cy', faceY)
                    .attr('r', 3)
                    .attr('fill', '#1e293b');
                photoGroup.append('circle')
                    .attr('cx', faceX + 15)
                    .attr('cy', faceY)
                    .attr('r', 3)
                    .attr('fill', '#1e293b');

                // Smile
                photoGroup.append('path')
                    .attr('d', `M ${faceX - 15} ${faceY + 20} Q ${faceX} ${faceY + 28} ${faceX + 15} ${faceY + 20}`)
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none');
            } else {
                // Dark view - still show face but dimmer
                photoGroup.append('circle')
                    .attr('cx', faceX - 15)
                    .attr('cy', faceY)
                    .attr('r', 3)
                    .attr('fill', '#1e293b')
                    .attr('opacity', 0.7);
                photoGroup.append('circle')
                    .attr('cx', faceX + 15)
                    .attr('cy', faceY)
                    .attr('r', 3)
                    .attr('fill', '#1e293b')
                    .attr('opacity', 0.7);

                // Smile
                photoGroup.append('path')
                    .attr('d', `M ${faceX - 15} ${faceY + 20} Q ${faceX} ${faceY + 28} ${faceX + 15} ${faceY + 20}`)
                    .attr('stroke', '#1e293b')
                    .attr('stroke-width', 2)
                    .attr('fill', 'none')
                    .attr('opacity', 0.7);
            }

            // Essence marker (hidden initially)
            photoGroup.append('circle')
                .attr('class', 'essence-marker')
                .attr('cx', x + this.photoWidth - 10)
                .attr('cy', 30)
                .attr('r', 8)
                .attr('fill', '#10b981')
                .attr('opacity', 0);

            photoGroup.append('text')
                .attr('class', 'essence-marker')
                .attr('x', x + this.photoWidth - 10)
                .attr('y', 33)
                .attr('text-anchor', 'middle')
                .attr('font-size', '10px')
                .attr('font-weight', 'bold')
                .attr('fill', 'white')
                .attr('opacity', 0)
                .text('✓');

            // Label
            const lines = photo.label.split('\n');
            lines.forEach((line, lineIdx) => {
                photoGroup.append('text')
                    .attr('x', x + this.photoWidth / 2)
                    .attr('y', 165 + lineIdx * 14)
                    .attr('text-anchor', 'middle')
                    .attr('font-size', '11px')
                    .attr('font-weight', photo.type === 'original' ? 'bold' : 'normal')
                    .attr('fill', '#2d3748')
                    .text(line);
            });
        });

        this.svg = svg;
    }

    showEssence() {
        if (this.isShowingEssence) return;
        this.isShowingEssence = true;

        // Show essence markers with animation
        this.svg.selectAll('.essence-marker')
            .transition()
            .duration(400)
            .attr('opacity', 1);

        // Add connecting lines between photos (showing they're the same person)
        for (let i = 0; i < this.photos.length - 1; i++) {
            const x1 = this.startX + i * (this.photoWidth + this.gap) + this.photoWidth;
            const x2 = this.startX + (i + 1) * (this.photoWidth + this.gap);

            this.svg.append('line')
                .attr('class', 'essence-connection')
                .attr('x1', x1)
                .attr('y1', 85)
                .attr('x2', x2)
                .attr('y2', 85)
                .attr('stroke', '#10b981')
                .attr('stroke-width', 3)
                .attr('stroke-dasharray', '5,5')
                .attr('opacity', 0)
                .transition()
                .duration(600)
                .attr('opacity', 0.7);
        }

        // Update status text
        document.getElementById('essence-status').innerHTML =
            '✓ El modelo aprende a <strong>ignorar las variaciones</strong> (bigote, luz, anteojos) y <strong>concentrarse en la esencia invariante</strong>: la estructura de la cara, que identifica a Alex en cualquier condición.';
    }

    reset() {
        this.isShowingEssence = false;

        // Hide essence markers
        this.svg.selectAll('.essence-marker')
            .transition()
            .duration(300)
            .attr('opacity', 0);

        // Remove connection lines
        this.svg.selectAll('.essence-connection').remove();

        // Clear status text
        document.getElementById('essence-status').textContent = '';
    }
}

// ========================================
// InfoNCE Playground (Gradual Convergence Animation)
// ========================================

class InfoNCEPlayground {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;

        this.iterationCounter = document.getElementById('iteration-count');
        this.nodes = Array.from(this.container.querySelectorAll('.infonce-node'));
        this.positions = new Map();

        // Animation parameters
        this.currentIteration = 0;
        this.maxIterations = 50;
        this.iterationDelay = 120; // ms between iterations
        this.isRunning = false;
        this.animationTimer = null;
        this.pauseDelay = 2000; // pause at end before restart

        this.nodes.forEach((node) => {
            const initial = this.getPosition(node, 'initial');
            const target = this.getPosition(node, 'target');
            this.positions.set(node, { initial, target });
        });

        this.resetPositions(false);
        this.startGradualOptimization();
    }

    getPosition(node, type) {
        const keyX = `${type}X`;
        const keyY = `${type}Y`;
        const x = parseFloat(node.dataset[keyX]);
        const y = parseFloat(node.dataset[keyY]);
        return {
            x: Number.isFinite(x) ? x : 0,
            y: Number.isFinite(y) ? y : 0
        };
    }

    setNodePosition(node, position) {
        if (!node || !position) return;
        node.style.setProperty('--x', `${position.x}px`);
        node.style.setProperty('--y', `${position.y}px`);
    }

    // Interpolate between initial and target based on progress (0 to 1)
    interpolatePosition(initial, target, progress) {
        // Use easing function for smooth convergence
        const eased = this.easeInOutCubic(progress);
        return {
            x: initial.x + (target.x - initial.x) * eased,
            y: initial.y + (target.y - initial.y) * eased
        };
    }

    easeInOutCubic(t) {
        return t < 0.5
            ? 4 * t * t * t
            : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    updateIteration() {
        const progress = this.currentIteration / this.maxIterations;

        // Update node positions based on current iteration
        this.positions.forEach(({ initial, target }, node) => {
            const currentPos = this.interpolatePosition(initial, target, progress);
            this.setNodePosition(node, currentPos);
        });

        // Update counter
        if (this.iterationCounter) {
            this.iterationCounter.textContent = this.currentIteration;
        }

        // Update visual state
        if (progress > 0.3) {
            this.container.classList.add('infonce-applied');
        } else {
            this.container.classList.remove('infonce-applied');
        }
    }

    resetPositions(shouldAnimate = true) {
        if (!shouldAnimate) {
            this.nodes.forEach((node) => {
                node.style.transition = 'none';
            });
        }

        this.currentIteration = 0;
        this.positions.forEach(({ initial }, node) => {
            this.setNodePosition(node, initial);
        });

        if (!shouldAnimate) {
            void this.container.offsetHeight;
            this.nodes.forEach((node) => {
                node.style.transition = '';
            });
        }

        this.container.classList.remove('infonce-applied');

        if (this.iterationCounter) {
            this.iterationCounter.textContent = '0';
        }
    }

    async startGradualOptimization() {
        if (this.isRunning) return;
        this.isRunning = true;

        while (this.isRunning) {
            // Optimization phase: iterate from 0 to max
            for (let i = 0; i <= this.maxIterations; i++) {
                if (!this.isRunning) break;

                this.currentIteration = i;
                this.updateIteration();

                await new Promise(resolve => setTimeout(resolve, this.iterationDelay));
            }

            // Pause at convergence
            await new Promise(resolve => setTimeout(resolve, this.pauseDelay));

            // Reset to initial positions
            this.resetPositions(true);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
    }

    stop() {
        this.isRunning = false;
        if (this.animationTimer) {
            clearTimeout(this.animationTimer);
        }
    }
}

// ========================================
// Scroll Reveal: Show sections only when scrolled into view
// ========================================

// Scroll reveal function - not needed for horizontal slides mode
// function setupScrollReveal() {
//     const sections = document.querySelectorAll('.problem-demo, .solution-demo, .key-insight, .question-section, .suspect, .transition');
//     const observerOptions = {
//         root: null,
//         rootMargin: '0px',
//         threshold: 0.2
//     };
//     const observer = new IntersectionObserver((entries) => {
//         entries.forEach(entry => {
//             if (entry.isIntersecting) {
//                 entry.target.classList.add('visible');
//             }
//         });
//     }, observerOptions);
//     sections.forEach(section => {
//         observer.observe(section);
//     });
// }

// ========================================
// Initialize Visualizations
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    // Setup horizontal slide navigation
    setupSlideNavigation();

    // Render formulas with KaTeX when available
    if (window.katex) {
        document.querySelectorAll('[data-katex]').forEach((element) => {
            const tex = element.dataset.katex;
            if (!tex) return;
            try {
                window.katex.render(tex, element, {
                    displayMode: true,
                    throwOnError: false
                });
            } catch (error) {
                // Fallback to plain text if rendering fails
                element.textContent = tex;
            }
        });
    }

    // Initialize Matrix Visualization (sparse data problem)
    const matrixViz = new MatrixVisualization('matrix-viz');

    // Initialize Alex Photos Visualization (essence learning)
    const alexPhotosViz = new AlexPhotosVisualization('alex-photos');

    // Initialize InfoNCE Playground
    new InfoNCEPlayground('infonce-space');

    const btnShowEssence = document.getElementById('btn-show-essence');
    const btnResetEssence = document.getElementById('btn-reset-essence');

    btnShowEssence.addEventListener('click', () => {
        btnShowEssence.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btnShowEssence.style.transform = 'scale(1)';
        }, 100);
        alexPhotosViz.showEssence();
    });

    btnResetEssence.addEventListener('click', () => {
        btnResetEssence.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btnResetEssence.style.transform = 'scale(1)';
        }, 100);
        alexPhotosViz.reset();
    });

    // Initialize Graph Visualization
    const graphViz = new GraphVisualization('graph-viz');

    // Add event listeners for graph buttons with feedback
    const btnAugment = document.getElementById('btn-augment');
    const btnReset = document.getElementById('btn-reset-graph');

    btnAugment.addEventListener('click', () => {
        btnAugment.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btnAugment.style.transform = 'scale(1)';
        }, 100);
        graphViz.augmentStructure();
    });

    btnReset.addEventListener('click', () => {
        btnReset.style.transform = 'scale(0.95)';
        setTimeout(() => {
            btnReset.style.transform = 'scale(1)';
        }, 100);
        graphViz.reset();
    });

    // Initialize Scatter Plot Visualization
    const scatterViz = new ScatterPlotVisualization('scatter-viz');

    // Add event listener for noise slider
    const noiseSlider = document.getElementById('noise-slider');
    const noiseValue = document.getElementById('noise-value');
    const noiseDecrease = document.getElementById('noise-decrease');
    const noiseIncrease = document.getElementById('noise-increase');

    const sliderMin = parseInt(noiseSlider.min, 10);
    const sliderMax = parseInt(noiseSlider.max, 10);

    const refreshNoiseButtons = () => {
        if (!noiseDecrease || !noiseIncrease) return;
        const current = parseInt(noiseSlider.value, 10);
        noiseDecrease.disabled = current <= sliderMin;
        noiseIncrease.disabled = current >= sliderMax;
    };

    const updateNoise = (value) => {
        const clamped = Math.max(sliderMin, Math.min(sliderMax, value));
        noiseSlider.value = clamped.toString();
        noiseValue.textContent = clamped.toString();
        scatterViz.updateNoise(clamped);
        refreshNoiseButtons();
    };

    noiseSlider.addEventListener('input', (e) => {
        updateNoise(parseInt(e.target.value, 10));
    });

    if (noiseDecrease && noiseIncrease) {
        const handleAdjust = (delta, button) => {
            if (button.disabled) return;
            const current = parseInt(noiseSlider.value, 10);
            const target = current + delta;
            const clamped = Math.max(sliderMin, Math.min(sliderMax, target));
            if (clamped === current) return;
            button.style.transform = 'scale(0.9)';
            setTimeout(() => {
                button.style.transform = 'scale(1)';
            }, 120);
            updateNoise(clamped);
        };

        noiseDecrease.addEventListener('click', () => handleAdjust(-5, noiseDecrease));
        noiseIncrease.addEventListener('click', () => handleAdjust(5, noiseIncrease));
        refreshNoiseButtons();
    }
});
