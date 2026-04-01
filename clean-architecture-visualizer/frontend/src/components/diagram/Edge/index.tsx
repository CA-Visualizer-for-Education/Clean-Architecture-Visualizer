import { useEffect, useId, useMemo, useState } from 'react';
import type { RefObject } from 'react';
import type { CANode, CAEdge } from '../../../lib/types';
import { EdgeSvg } from './styles';

type ArrowHeadType = 'filledTriangle' | 'hollowTriangle' | 'none';
type RectSide = 'left' | 'right' | 'top' | 'bottom';

export type EdgeRouteHint = {
    // Routing mode override for this edge.
    // hvh/vhv: 2 bends, elbowH/elbowV: 1 bend, straight: direct line,
    // hvhv/vhvh: 3 bends for crowded layouts.
    mode?: 'auto' | 'straight' | 'elbow' | 'elbowH' | 'elbowV' | 'hvh' | 'vhv' | 'hvhv' | 'vhvh' | 'horizontal' | 'vertical';
    // Optional normalized bend location used by multi-segment routes.
    viaRatio?: number;
    // Optional explicit anchor sides on start/end nodes.
    startSide?: RectSide;
    endSide?: RectSide;
};

type EdgeProps = {
    startNode: CANode;
    endNode: CANode;
    status: CAEdge['status'];
    arrowHeadType: ArrowHeadType;
    containerRef: RefObject<HTMLElement | null>;
    routeHint?: EdgeRouteHint;
};

type Point = { x: number; y: number };
type RouteDirection = 'horizontal' | 'vertical';

// Returns the center of a DOMRect in viewport coordinates.
function getCenter(rect: DOMRect): Point {
    return {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
    };
}

// Escape node ids before using them in querySelector attribute selectors.
function cssEscape(value: string): string {
    if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
        return CSS.escape(value);
    }
    return value.replace(/"/g, '\\"');
}

// Keep ratio inputs safe even if hints contain out-of-range values.
function clamp01(value: number): number {
    return Math.min(1, Math.max(0, value));
}

// Anchor the edge on a specific side of a node rectangle.
function getPointOnRectSide(rect: DOMRect, side: RectSide): Point {
    const center = getCenter(rect);

    if (side === 'left') return { x: rect.left, y: center.y };
    if (side === 'right') return { x: rect.right, y: center.y };
    if (side === 'top') return { x: center.x, y: rect.top };
    return { x: center.x, y: rect.bottom };
}

export function Edge({ startNode, endNode, status, arrowHeadType, containerRef, routeHint }: EdgeProps) {
    const markerId = useId().replace(/:/g, '_');
    // Violations are emphasized in red; valid/default edges use neutral dark stroke.
    const strokeColor = status === 'VIOLATION' || status === 'INCORRECT_DEPENDENCY' ? '#d32f2f' : '#1a1a1a';
    const [line, setLine] = useState<{ x1: number; y1: number; x2: number; y2: number; direction: RouteDirection } | null>(null);

    // Marker id is unique per edge instance to avoid collisions in shared SVG defs.
    const markerEnd = useMemo(() => {
        if (arrowHeadType === 'none') return undefined;
        return `url(#${markerId})`;
    }, [arrowHeadType, markerId]);

    useEffect(() => {
        let animationFrameId: number | null = null;

        const container = containerRef.current;
        if (!container) {
            return;
        }

        const startElement = container.querySelector(`[data-ca-node-id="${cssEscape(startNode.id)}"]`) as HTMLElement | null;
        const endElement = container.querySelector(`[data-ca-node-id="${cssEscape(endNode.id)}"]`) as HTMLElement | null;

        if (!startElement || !endElement) {
            return;
        }

        const updateLine = () => {
            const containerRect = container.getBoundingClientRect();
            const startRect = startElement.getBoundingClientRect();
            const endRect = endElement.getBoundingClientRect();

            const startCenter = getCenter(startRect);
            const endCenter = getCenter(endRect);
            const dx = endCenter.x - startCenter.x;
            const dy = endCenter.y - startCenter.y;
            const mode = routeHint?.mode ?? 'auto';
            // Direction controls whether the default path is HVH or VHV.
            const direction: RouteDirection = mode === 'hvh' || mode === 'hvhv' || mode === 'horizontal' || mode === 'elbowH'
                ? 'horizontal'
                : mode === 'vhv' || mode === 'vhvh' || mode === 'vertical' || mode === 'elbowV'
                    ? 'vertical'
                    : Math.abs(dx) >= Math.abs(dy)
                        ? 'horizontal'
                        : 'vertical';

            const resolvedStartSide: RectSide = routeHint?.startSide
                ?? (direction === 'horizontal'
                    ? (dx >= 0 ? 'right' : 'left')
                    : (dy >= 0 ? 'bottom' : 'top'));

            const resolvedEndSide: RectSide = routeHint?.endSide
                ?? (direction === 'horizontal'
                    ? (dx >= 0 ? 'left' : 'right')
                    : (dy >= 0 ? 'top' : 'bottom'));

            const from = getPointOnRectSide(startRect, resolvedStartSide);
            const to = getPointOnRectSide(endRect, resolvedEndSide);

            // Convert viewport coordinates into container-local SVG coordinates.
            setLine({
                x1: from.x - containerRect.left,
                y1: from.y - containerRect.top,
                x2: to.x - containerRect.left,
                y2: to.y - containerRect.top,
                direction,
            });
        };

        animationFrameId = requestAnimationFrame(updateLine);

        const resizeObserver = new ResizeObserver(updateLine);
        resizeObserver.observe(container);
        resizeObserver.observe(startElement);
        resizeObserver.observe(endElement);

        // Recompute path when layout shifts due to viewport or scroll changes.
        window.addEventListener('resize', updateLine);
        container.addEventListener('scroll', updateLine, { passive: true });

        return () => {
            if (animationFrameId !== null) {
                cancelAnimationFrame(animationFrameId);
            }
            resizeObserver.disconnect();
            window.removeEventListener('resize', updateLine);
            container.removeEventListener('scroll', updateLine);
        };
    }, [
        containerRef,
        startNode.id,
        endNode.id,
        routeHint?.mode,
        routeHint?.viaRatio,
        routeHint?.startSide,
        routeHint?.endSide,
    ]);

    if (!line) {
        return null;
    }

    // viaRatio is normalized [0..1] along the edge span:
    // 0 keeps the bend near the start anchor, 0.5 centers it, 1 pushes it near the end anchor.
    const viaRatio = routeHint?.viaRatio;
    const mode = routeHint?.mode;

    let orthogonalPath: string;

    // Straight mode draws a direct segment between resolved anchors.
    if (mode === 'straight') {
        orthogonalPath = `M ${line.x1} ${line.y1} L ${line.x2} ${line.y2}`;
        // Single-bend elbows, forced orientation.
    } else if (mode === 'elbowH' || (mode === 'elbow' && line.direction === 'horizontal')) {
        orthogonalPath = `M ${line.x1} ${line.y1} L ${line.x2} ${line.y1} L ${line.x2} ${line.y2}`;
    } else if (mode === 'elbowV' || (mode === 'elbow' && line.direction === 'vertical')) {
        orthogonalPath = `M ${line.x1} ${line.y1} L ${line.x1} ${line.y2} L ${line.x2} ${line.y2}`;
    } else if (mode === 'hvhv') {
        // Horizontal-Vertical-Horizontal-Vertical: adds an extra turn to avoid node edges
        const viaX = viaRatio == null
            ? (line.x1 + line.x2) / 2
            : line.x1 + (line.x2 - line.x1) * clamp01(viaRatio);
        const midY = (line.y1 + line.y2) / 2;
        orthogonalPath = `M ${line.x1} ${line.y1} L ${viaX} ${line.y1} L ${viaX} ${midY} L ${line.x2} ${midY} L ${line.x2} ${line.y2}`;
    } else if (mode === 'vhvh') {
        // Vertical-Horizontal-Vertical-Horizontal: adds an extra turn to avoid node edges
        const viaY = viaRatio == null
            ? (line.y1 + line.y2) / 2
            : line.y1 + (line.y2 - line.y1) * clamp01(viaRatio);
        const midX = (line.x1 + line.x2) / 2;
        orthogonalPath = `M ${line.x1} ${line.y1} L ${line.x1} ${viaY} L ${midX} ${viaY} L ${midX} ${line.y2} L ${line.x2} ${line.y2}`;
    } else if (line.direction === 'horizontal') {
        // Standard HVH
        const viaX = viaRatio == null
            ? (line.x1 + line.x2) / 2
            : line.x1 + (line.x2 - line.x1) * clamp01(viaRatio);
        orthogonalPath = `M ${line.x1} ${line.y1} L ${viaX} ${line.y1} L ${viaX} ${line.y2} L ${line.x2} ${line.y2}`;
    } else {
        // Standard VHV
        const viaY = viaRatio == null
            ? (line.y1 + line.y2) / 2
            : line.y1 + (line.y2 - line.y1) * clamp01(viaRatio);
        orthogonalPath = `M ${line.x1} ${line.y1} L ${line.x1} ${viaY} L ${line.x2} ${viaY} L ${line.x2} ${line.y2}`;
    }

    return (
        <EdgeSvg aria-hidden="true" focusable="false">
            <defs>
                {/* Filled marker for dependency-like arrows. */}
                {arrowHeadType === 'filledTriangle' && (
                    <marker id={markerId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                        <polygon points="0 0, 10 3.5, 0 7" fill={strokeColor} />
                    </marker>
                )}
                {/* Hollow marker for inheritance-like arrows. */}
                {arrowHeadType === 'hollowTriangle' && (
                    <marker id={markerId} markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto" markerUnits="strokeWidth">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#ffffff" stroke={strokeColor} strokeWidth="1" />
                    </marker>
                )}
            </defs>
            <path
                d={orthogonalPath}
                stroke={strokeColor}
                strokeWidth={2}
                fill="none"
                markerEnd={markerEnd}
            />
        </EdgeSvg>
    );
}
