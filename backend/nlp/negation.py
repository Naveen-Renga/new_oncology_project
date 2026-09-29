import re
from typing import List, Tuple

# Standard clinical negation triggers (NegEx algorithm inspired)
NEGATION_PRE_TRIGGERS = [
    r"\bdenies\b",
    r"\bdenied\b",
    r"\bno\s+evidence\s+of\b",
    r"\bno\s+sign\s+of\b",
    r"\bnegative\s+for\b",
    r"\bwithout\b",
    r"\bfree\s+of\b",
    r"\bno\b",
    r"\bnot\b",
    r"\brules?\s+out\b",
    r"\bunlikely\b"
]

NEGATION_POST_TRIGGERS = [
    r"\bwas\s+ruled\s+out\b",
    r"\bwas\s+unlikely\b",
    r"\bwas\s+negative\b"
]

def is_entity_negated(entity: str, text: str, window_chars: int = 40) -> Tuple[bool, str]:
    """
    Determines whether a clinical mention is syntactically negated.
    Scans a pre-entity and post-entity character window for clinical negation triggers.
    """
    lower_text = text.lower()
    lower_entity = entity.lower()

    pos = lower_text.find(lower_entity)
    if pos == -1:
        return False, ""

    start_pre = max(0, pos - window_chars)
    pre_window = lower_text[start_pre:pos]

    for trigger in NEGATION_PRE_TRIGGERS:
        if re.search(trigger, pre_window):
            return True, f"Pre-negation trigger matched in window: '{trigger}'"

    end_post = min(len(lower_text), pos + len(lower_entity) + window_chars)
    post_window = lower_text[pos + len(lower_entity):end_post]

    for trigger in NEGATION_POST_TRIGGERS:
        if re.search(trigger, post_window):
            return True, f"Post-negation trigger matched in window: '{trigger}'"

    return False, ""
