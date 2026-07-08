"""
Library enrichment — converts raw Jellyfin items to
uHomeNest MediaItem format consumable by the console.
"""

from typing import Any, Optional

from modules.media.jellyfin_client import (
    get_image_url,
    get_library_items,
    get_item as jf_get_item,
    get_stream_url,
    is_configured,
    health_check as jf_health,
)


# ── type mapping ──────────────────────────────────────────────

_JF_TYPE_MAP: dict[str, str] = {
    "Movie": "movie",
    "Series": "tv",
    "MusicArtist": "music",
    "Audio": "music",
    "MusicAlbum": "album",
    "Episode": "tv",
    "Season": "tv",
}


def _map_type(jf_type: str) -> str:
    return _JF_TYPE_MAP.get(jf_type, "movie")


def _map_rating(jf_item: dict[str, Any]) -> Optional[str]:
    official = jf_item.get("OfficialRating")
    if official:
        return official
    community = jf_item.get("CommunityRating")
    if community is not None:
        return str(community)
    return None


def _enrich_item(jf_item: dict[str, Any]) -> dict[str, Any]:
    """Convert a raw Jellyfin item dict into a console-ready MediaItem."""
    item_id = jf_item.get("Id", "")
    image_tags = jf_item.get("ImageTags", {})
    primary_tag = image_tags.get("Primary") if image_tags else None
    poster = get_image_url(item_id, primary_tag)

    return {
        "id": item_id,
        "title": jf_item.get("Name", "Untitled"),
        "type": _map_type(jf_item.get("Type", "")),
        "year": jf_item.get("ProductionYear"),
        "rating": _map_rating(jf_item),
        "poster": poster,
        "subtitle": jf_item.get("Overview", ""),
    }


# ── public API ─────────────────────────────────────────────────


def fetch_library(
    limit: int = 50,
    start_index: int = 0,
    media_type: Optional[str] = None,
) -> dict[str, Any]:
    """Return enriched library items and category counts.

    Returns:
        {
            "items": [...],       # enriched MediaItem dicts
            "categories": [...],  # { id, label, count }
            "jellyfin_online": bool,
        }
    """
    item_types = "Movie,Series,MusicArtist"
    if media_type == "movie":
        item_types = "Movie"
    elif media_type == "tv":
        item_types = "Series"
    elif media_type == "music":
        item_types = "Audio,MusicArtist,MusicAlbum"

    raw = get_library_items(
        limit=limit,
        start_index=start_index,
        include_item_types=item_types,
    )
    items = [_enrich_item(r) for r in raw]

    # Build category counts from all library items
    all_raw = get_library_items(
        limit=1000,
        include_item_types="Movie,Series,MusicArtist,Audio,MusicAlbum",
    )
    categorised: dict[str, int] = {}
    for r in all_raw:
        cat = _map_type(r.get("Type", ""))
        categorised[cat] = categorised.get(cat, 0) + 1

    categories = [
        {"id": "movie", "label": "Movies",
         "count": categorised.get("movie", 0)},
        {"id": "tv", "label": "TV Shows",
         "count": categorised.get("tv", 0)},
        {"id": "music", "label": "Music",
         "count": categorised.get("music", 0)},
        {"id": "album", "label": "Albums",
         "count": categorised.get("album", 0)},
    ]

    online = (
        is_configured() and jf_health().get("online", False)
    )
    return {
        "items": items,
        "categories": categories,
        "jellyfin_online": online,
    }


def fetch_detail(item_id: str) -> Optional[dict[str, Any]]:
    """Return enriched detail for a single media item."""
    jf_item = jf_get_item(item_id)
    if jf_item is None:
        return None
    enriched = _enrich_item(jf_item)
    enriched["stream_url"] = get_stream_url(item_id)
    enriched["genres"] = jf_item.get("Genres", [])
    enriched["overview"] = jf_item.get("Overview", "")
    return enriched


def fetch_health() -> dict[str, Any]:
    return jf_health()