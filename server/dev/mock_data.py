"""
Mock fixtures for local development — realistic Jellyfin and Home Assistant
data used when MOCK_JELLYFIN=1 / MOCK_HA=1.

No real servers required — just data.
"""

# ── Jellyfin library items ─────────────────────────────────────

MOCK_LIBRARY_ITEMS = [
    {
        "Id": "movie-001", "Name": "The Grand Budapest Hotel",
        "Type": "Movie", "ProductionYear": 2014,
        "OfficialRating": "R", "CommunityRating": 8.1,
        "Overview": "A writer encounters the owner of an aging high-class hotel, who tells him of his early years serving as a lobby boy in the hotel's glorious years under an exceptional concierge.",
        "Genres": ["Comedy", "Drama"],
        "ImageTags": {"Primary": "primary-tag-001"},
    },
    {
        "Id": "movie-002", "Name": "Blade Runner 2049",
        "Type": "Movie", "ProductionYear": 2017,
        "OfficialRating": "R", "CommunityRating": 8.0,
        "Overview": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who's been missing for thirty years.",
        "Genres": ["Science Fiction", "Drama"],
        "ImageTags": {"Primary": "primary-tag-002"},
    },
    {
        "Id": "movie-003", "Name": "Everything Everywhere All at Once",
        "Type": "Movie", "ProductionYear": 2022,
        "OfficialRating": "R", "CommunityRating": 7.8,
        "Overview": "An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.",
        "Genres": ["Action", "Adventure", "Comedy"],
        "ImageTags": {"Primary": "primary-tag-003"},
    },
    {
        "Id": "movie-004", "Name": "Spirited Away",
        "Type": "Movie", "ProductionYear": 2001,
        "OfficialRating": "PG", "CommunityRating": 8.6,
        "Overview": "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.",
        "Genres": ["Animation", "Adventure", "Family"],
        "ImageTags": {"Primary": "primary-tag-004"},
    },
    {
        "Id": "movie-005", "Name": "The Dark Knight",
        "Type": "Movie", "ProductionYear": 2008,
        "OfficialRating": "PG-13", "CommunityRating": 9.0,
        "Overview": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.",
        "Genres": ["Action", "Crime", "Drama"],
        "ImageTags": {"Primary": "primary-tag-005"},
    },
    {
        "Id": "tv-001", "Name": "Breaking Bad",
        "Type": "Series", "ProductionYear": 2008,
        "OfficialRating": "TV-MA", "CommunityRating": 9.5,
        "Overview": "A high school chemistry teacher diagnosed with inoperable lung cancer turns to manufacturing and selling methamphetamine in order to secure his family's future.",
        "Genres": ["Crime", "Drama", "Thriller"],
        "ImageTags": {"Primary": "primary-tag-tv-001"},
    },
    {
        "Id": "tv-002", "Name": "The Bear",
        "Type": "Series", "ProductionYear": 2022,
        "OfficialRating": "TV-MA", "CommunityRating": 8.6,
        "Overview": "A young chef from the fine dining world returns to Chicago to run his family's sandwich shop.",
        "Genres": ["Comedy", "Drama"],
        "ImageTags": {"Primary": "primary-tag-tv-002"},
    },
    {
        "Id": "tv-003", "Name": "Planet Earth II",
        "Type": "Series", "ProductionYear": 2016,
        "OfficialRating": "TV-G", "CommunityRating": 9.5,
        "Overview": "David Attenborough returns with a new wildlife documentary that shows life in a variety of habitats.",
        "Genres": ["Documentary"],
        "ImageTags": {"Primary": "primary-tag-tv-003"},
    },
    {
        "Id": "music-001", "Name": "Random Access Memories",
        "Type": "MusicArtist", "ProductionYear": 2013,
        "CommunityRating": 8.0,
        "Overview": "Daft Punk's fourth studio album.",
        "Genres": ["Electronic", "Disco", "Funk"],
        "ImageTags": {"Primary": "primary-tag-music-001"},
    },
    {
        "Id": "music-002", "Name": "Kind of Blue",
        "Type": "MusicArtist", "ProductionYear": 1959,
        "CommunityRating": 9.0,
        "Overview": "Miles Davis' landmark jazz album.",
        "Genres": ["Jazz", "Modal"],
        "ImageTags": {"Primary": "primary-tag-music-002"},
    },
    {
        "Id": "music-003", "Name": "A Moon Shaped Pool",
        "Type": "MusicArtist", "ProductionYear": 2016,
        "CommunityRating": 8.3,
        "Overview": "Radiohead's ninth studio album.",
        "Genres": ["Alternative", "Art Rock"],
        "ImageTags": {"Primary": "primary-tag-music-003"},
    },
]

# ── Jellyfin Live TV channels ──────────────────────────────────

MOCK_TV_CHANNELS = [
    {
        "Id": "ch-001", "Name": "BBC One", "Number": "1",
        "ImageTags": {},
    },
    {
        "Id": "ch-002", "Name": "BBC Two", "Number": "2",
        "ImageTags": {},
    },
    {
        "Id": "ch-003", "Name": "ITV", "Number": "3",
        "ImageTags": {},
    },
    {
        "Id": "ch-004", "Name": "Channel 4", "Number": "4",
        "ImageTags": {},
    },
    {
        "Id": "ch-005", "Name": "ABC News", "Number": "24",
        "ImageTags": {},
    },
]

# ── EPG programme schedules ────────────────────────────────────

MOCK_PROGRAMMES = {
    "ch-001": [
        {
            "Id": "prog-001", "Name": "BBC News at Six",
            "ChannelId": "ch-001", "StartDate": "2026-07-08T18:00:00Z",
            "EndDate": "2026-07-08T18:30:00Z",
            "Overview": "The latest national and international news from the BBC.",
        },
        {
            "Id": "prog-002", "Name": "EastEnders",
            "ChannelId": "ch-001", "StartDate": "2026-07-08T19:30:00Z",
            "EndDate": "2026-07-08T20:00:00Z",
            "Overview": "Drama series set in the fictional East End borough of Walford.",
        },
        {
            "Id": "prog-003", "Name": "Doctor Who",
            "ChannelId": "ch-001", "StartDate": "2026-07-08T20:00:00Z",
            "EndDate": "2026-07-08T21:00:00Z",
            "Overview": "The Doctor and companions travel through time and space.",
        },
    ],
    "ch-002": [
        {
            "Id": "prog-004", "Name": "Mastermind",
            "ChannelId": "ch-002", "StartDate": "2026-07-08T19:00:00Z",
            "EndDate": "2026-07-08T19:30:00Z",
            "Overview": "Iconic quiz show. Specialist subjects and general knowledge.",
        },
        {
            "Id": "prog-005", "Name": "University Challenge",
            "ChannelId": "ch-002", "StartDate": "2026-07-08T20:00:00Z",
            "EndDate": "2026-07-08T20:30:00Z",
            "Overview": "Academic quiz competition between university teams.",
        },
    ],
    "ch-003": [
        {
            "Id": "prog-006", "Name": "The Chase",
            "ChannelId": "ch-003", "StartDate": "2026-07-08T17:00:00Z",
            "EndDate": "2026-07-08T18:00:00Z",
            "Overview": "Quiz show where contestants face the Chaser.",
        },
    ],
    "ch-004": [
        {
            "Id": "prog-007", "Name": "Bake Off: The Professionals",
            "ChannelId": "ch-004", "StartDate": "2026-07-08T20:00:00Z",
            "EndDate": "2026-07-08T21:00:00Z",
            "Overview": "Professional baking teams compete in challenges.",
        },
    ],
    "ch-005": [
        {
            "Id": "prog-008", "Name": "World News Tonight",
            "ChannelId": "ch-005", "StartDate": "2026-07-08T18:30:00Z",
            "EndDate": "2026-07-08T19:00:00Z",
            "Overview": "Global news coverage with analysis.",
        },
    ],
}

# ── Home Assistant bridge mock data ────────────────────────────

MOCK_HA_SCENES = [
    {
        "entity_id": "scene.evening_relax",
        "friendly_name": "Evening Relax",
        "attributes": {
            "entity_id": ["light.living_room", "light.kitchen"],
            "icon": "mdi:weather-night",
        },
    },
    {
        "entity_id": "scene.movie_time",
        "friendly_name": "Movie Time",
        "attributes": {
            "entity_id": ["light.living_room", "media_player.living_room_tv"],
            "icon": "mdi:movie",
        },
    },
    {
        "entity_id": "scene.good_morning",
        "friendly_name": "Good Morning",
        "attributes": {
            "entity_id": ["light.bedroom", "light.kitchen", "switch.coffee_maker"],
            "icon": "mdi:weather-sunny",
        },
    },
    {
        "entity_id": "scene.bedtime",
        "friendly_name": "Bedtime",
        "attributes": {
            "entity_id": ["light.bedroom", "lock.front_door"],
            "icon": "mdi:sleep",
        },
    },
]

MOCK_HA_ENTITIES = [
    {
        "entity_id": "light.living_room",
        "friendly_name": "Living Room Lights",
        "state": "on",
        "attributes": {"brightness": 180, "color_temp": 370},
    },
    {
        "entity_id": "light.kitchen",
        "friendly_name": "Kitchen Lights",
        "state": "off",
        "attributes": {},
    },
    {
        "entity_id": "light.bedroom",
        "friendly_name": "Bedroom Lights",
        "state": "on",
        "attributes": {"brightness": 100},
    },
    {
        "entity_id": "switch.coffee_maker",
        "friendly_name": "Coffee Maker",
        "state": "off",
        "attributes": {},
    },
    {
        "entity_id": "lock.front_door",
        "friendly_name": "Front Door Lock",
        "state": "locked",
        "attributes": {},
    },
    {
        "entity_id": "climate.living_room",
        "friendly_name": "Living Room Thermostat",
        "state": "heat",
        "attributes": {"current_temperature": 21.5, "temperature": 22.0},
    },
    {
        "entity_id": "media_player.living_room_tv",
        "friendly_name": "Living Room TV",
        "state": "off",
        "attributes": {"source": "HDMI 1"},
    },
    {
        "entity_id": "sensor.outdoor_temperature",
        "friendly_name": "Outdoor Temperature",
        "state": "18.2",
        "attributes": {"unit_of_measurement": "°C"},
    },
]

# ── Jellyfin server info mock ──────────────────────────────────

MOCK_SYSTEM_INFO = {
    "Version": "10.9.11",
    "ServerName": "HomeNest Dev Jellyfin",
    "OperatingSystem": "Linux",
    "Id": "dev-jellyfin-001",
}

# ── Jellyfin user mock ─────────────────────────────────────────

MOCK_USERS = [
    {
        "Id": "dev-user-001",
        "Name": "HomeNest Dev",
        "HasPassword": True,
        "HasConfiguredPassword": True,
    },
]

# ── Now-playing mock state ─────────────────────────────────────

MOCK_NOW_PLAYING = {
    "playing": False,
    "item": None,
    "position": 0,
    "duration": 0,
    "volume": 50,
    "paused": False,
}

# ── Playback targets mock ──────────────────────────────────────

MOCK_PLAYBACK_TARGETS = [
    {
        "id": "desktop-chrome",
        "name": "Desktop (Chrome)",
        "type": "web",
        "available": True,
    },
    {
        "id": "living-room-tv",
        "name": "Living Room TV",
        "type": "dlna",
        "available": True,
    },
    {
        "id": "kitchen-display",
        "name": "Kitchen Display",
        "type": "dlna",
        "available": False,
    },
]