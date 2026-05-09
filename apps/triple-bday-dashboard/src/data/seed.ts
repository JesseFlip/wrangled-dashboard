import type { DashboardData } from "../types";

export const SEED_DATA: DashboardData = {
  guests: [
    { id: "1", name: "Jesse", role: "honoree", rsvpStatus: "yes" },
    { id: "2", name: "Dorys", role: "honoree", rsvpStatus: "yes" },
    { id: "3", name: "Lihi Leibovich", role: "active", rsvpStatus: "maybe" },
    { id: "4", name: "Ryan", role: "other", rsvpStatus: "maybe", partner: "Lihi Leibovich" },
    { id: "5", name: "YuTing Chu", role: "active", rsvpStatus: "pending" },
    { id: "6", name: "Rene Hernandez", role: "active", rsvpStatus: "yes" },
    { id: "7", name: "Veronica", role: "other", rsvpStatus: "yes", partner: "Rene Hernandez" },
    { id: "8", name: "Dorys Flippen", role: "other", rsvpStatus: "pending" },
    { id: "9", name: "Tania Marisol Reyes", role: "active", rsvpStatus: "pending" },
    { id: "10", name: "Cook Ie", role: "active", rsvpStatus: "yes" },
    { id: "11", name: "游文伸 (Wen-Shen)", role: "other", rsvpStatus: "pending" },
    { id: "12", name: "Facebook user", role: "other", rsvpStatus: "pending" },
    { id: "13", name: "Trio Honoree 3", role: "honoree", rsvpStatus: "yes" }, // Placeholder for the 3rd honoree
  ],
  honorees: [
    {
      guestId: "1",
      name: "Jesse",
      signatureColor: "#FF6B6B",
      signatureDrink: "Old Fashioned",
      playlistContributed: true,
      dedication: "The creative force behind the WrangLED visuals."
    },
    {
      guestId: "2",
      name: "Dorys",
      signatureColor: "#1A535C",
      signatureDrink: "Spicy Margarita",
      playlistContributed: true,
      dedication: "The coordinator making sure the hot pot stays hot."
    },
    {
      guestId: "13",
      name: "Third TBD",
      signatureColor: "#FFE66D",
      signatureDrink: "Islay Scotch",
      playlistContributed: false,
      dedication: "The mysterious third honoree of the trio."
    }
  ],
  schedule: [
    {
      id: "s1",
      startTime: "13:00",
      endTime: "16:00",
      title: "Outdoor Activity",
      location: "TBD",
      description: "Something fun in the Dallas sun.",
      status: "planned",
      notes: "Cook to confirm spot"
    },
    {
      id: "s2",
      startTime: "16:30",
      endTime: "17:00",
      title: "Arrival at House",
      location: "Jesse & Dorys' Home",
      description: "Refresh and prep for dinner.",
      status: "confirmed"
    },
    {
      id: "s3",
      startTime: "17:00",
      endTime: "19:00",
      title: "Hot Pot Feast",
      location: "Dining Room",
      description: "Communal dinner starts.",
      status: "confirmed"
    },
    {
      id: "s4",
      startTime: "19:00",
      endTime: "20:30",
      title: "Cake & Toasts",
      location: "Living Room",
      description: "Celebrating the trio.",
      status: "confirmed"
    },
    {
      id: "s5",
      startTime: "20:30",
      endTime: "22:00",
      title: "Wind-down",
      location: "Home",
      description: "Relaxing and sharing stories.",
      status: "tentative"
    }
  ],
  shopping: [
    { id: "sh1", category: "food", name: "Hot pot ingredients", quantity: "Assorted", store: "99 Ranch Plano", purchased: false },
    { id: "sh2", category: "food", name: "Broths & Sauces", quantity: "Assorted", store: "99 Ranch", purchased: false },
    { id: "sh3", category: "drinks", name: "Laphroaig 10", quantity: "1 bottle", store: "Total Wine", purchased: false },
    { id: "sh4", category: "drinks", name: "Lagavulin 16", quantity: "1 bottle", store: "Total Wine", purchased: false },
    { id: "sh5", category: "drinks", name: "Ardbeg 10", quantity: "1 bottle", store: "Total Wine", purchased: false },
    { id: "sh6", category: "decor", name: "Balloon arch kit", quantity: "1", store: "Amazon", purchased: true },
    { id: "sh7", category: "decor", name: "Custom banner", quantity: "1", store: "FedEx", purchased: false },
    { id: "sh8", category: "logistics", name: "Instant camera film", quantity: "3 packs", store: "Amazon", purchased: false },
    { id: "sh9", category: "decor", name: "Votive candles", quantity: "12", store: "Target", purchased: false },
    { id: "sh10", category: "decor", name: "Table runner", quantity: "1", store: "Target", purchased: false },
    { id: "sh11", category: "decor", name: "Chalkboard sign", quantity: "1", store: "Hobby Lobby", purchased: true },
    { id: "sh12", category: "print", name: "Ingredient cards", quantity: "20", store: "Home", purchased: false },
    { id: "sh13", category: "print", name: "Sauce labels", quantity: "10", store: "Home", purchased: false },
    { id: "sh14", category: "print", name: "Islay flight tasting cards", quantity: "10", store: "Home", purchased: false },
  ],
  tasks: [
    { id: "t1", title: "Confirm date with honorees", dueDate: "2026-05-15", owner: "Jesse", status: "done" },
    { id: "t2", title: "Ask Cook for venue name", dueDate: "2026-05-16", owner: "Dorys", status: "todo" },
    { id: "t3", title: "Check Lihi's calendar", dueDate: "2026-05-14", owner: "Jesse", status: "doing" },
    { id: "t4", title: "Order custom banner", dueDate: "2026-05-20", owner: "Dorys", status: "todo" },
    { id: "t5", title: "Design WrangLED content", dueDate: "2026-05-25", owner: "Jesse", status: "todo" },
    { id: "t6", title: "Collect 5 songs from each honoree", dueDate: "2026-05-30", owner: "Jesse", status: "todo" },
    { id: "t7", title: "Supply run morning-of", dueDate: "2026-06-10", owner: "Jesse", status: "todo" },
    { id: "t8", title: "Pre-prep ingredient platters", dueDate: "2026-06-10", owner: "Dorys", status: "todo" },
  ],
  decor: [
    { id: "d1", area: "entry", description: "Custom triple banner", status: "planned" },
    { id: "d2", area: "entry", description: "Balloon arch in three colors", status: "planned" },
    { id: "d3", area: "entry", description: "Chalkboard sign", status: "done" },
    { id: "d4", area: "hotpotTable", description: "Ingredient cards & Sauce labels", status: "idea" },
    { id: "d5", area: "hotpotTable", description: "Islay flight tasting cards", status: "idea" },
    { id: "d6", area: "photoWall", description: "Polaroid photo wall", status: "planned" },
    { id: "d7", area: "led", description: "WrangLED custom content loop", status: "planned" },
    { id: "d8", area: "wyattCorner", description: "Dedicated corner for Wyatt", status: "idea" },
  ]
};
